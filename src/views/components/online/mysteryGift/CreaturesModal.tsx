import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
  Input,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
  PaddedInputContainer,
  Toggle,
} from '@components/inputs';
import { DarkButton, DeleteButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { StudioDropDown } from '@components/StudioDropDown';

import { SelectPokemon } from '@components/selects/SelectPokemon';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { SelectNature } from '@components/selects/SelectNature';
import { SelectAbility } from '@components/selects/SelectAbility';
import { SelectItem } from '@components/selects/SelectItem';
import { SelectMove } from '@components/selects/SelectMove';

import { useProjectNatures } from '@hooks/useProjectData';

import type { GiftCreature, GiftEgg } from '@utils/onlineApi';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
  background-color: rgba(10, 9, 11, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 12px;
  padding: 24px;
  width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
`;

const ModalTitle = styled.h3`
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-right: 8px;
`;

const CreatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};

  h4 {
    ${({ theme }) => theme.fonts.normalMedium};
    margin: 0;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ButtonBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

// Anchored "Add" button bar — sits between the scrollable list and the
// save/cancel row so its width stays stable even when the scrollbar appears
// inside ScrollArea (which would otherwise shave ~15px off and visually shrink
// the button after the second entry is added).
const AddBar = styled.div`
  display: flex;
`;

// Tri-state. `'random'` omits the `shiny` field at save-time so PSDK falls
// back to the game's own shiny rate roll. `'always'` / `'never'` map to the
// explicit boolean the server expects.
const buildShinyOptions = (t: (k: string) => string) => [
  { value: 'random', label: t('online_gift_shiny_random') },
  { value: 'true', label: t('online_gift_shiny_always') },
  { value: 'false', label: t('online_gift_shiny_never') },
];

type ShinyChoice = 'random' | 'true' | 'false';

const shinyToChoice = (shiny: boolean | undefined): ShinyChoice => (shiny === true ? 'true' : shiny === false ? 'false' : 'random');
const choiceToShiny = (choice: ShinyChoice): boolean | undefined => (choice === 'true' ? true : choice === 'false' ? false : undefined);

const buildGenderOptions = (t: (k: string) => string) => [
  { value: '0', label: t('online_gift_gender_unspecified') },
  { value: '1', label: t('online_gift_gender_male') },
  { value: '2', label: t('online_gift_gender_female') },
];

// Unified state representation for the UI form.
type CreatureUIState = {
  isEgg: boolean;
  id: string; // dbSymbol
  level: number;
  shiny: ShinyChoice; // 'random' | 'true' | 'false'; 'random' omits from payload
  form: number;
  gender?: string; // '0', '1', '2' or undefined
  nature?: string; // dbSymbol
  ability?: string; // dbSymbol
  item?: string; // dbSymbol
  given_name?: string;
  moves?: string[];
};

type Props = {
  initialCreatures: GiftCreature[];
  initialEggs: GiftEgg[];
  onSave: (creatures: GiftCreature[], eggs: GiftEgg[]) => void;
  onCancel: () => void;
};

export const CreaturesModal = ({ initialCreatures, initialEggs, onSave, onCancel }: Props) => {
  const { t } = useTranslation();
  const shinyOptions = buildShinyOptions(t);
  const genderOptions = buildGenderOptions(t);
  const { projectDataValues: natures } = useProjectNatures();

  // Map incoming data to our unified UI state.
  // Stored creatures may have numeric `gender` / `nature` (the format the server
  // requires); the UI form uses string dropdown values + dbSymbols. Coerce back.
  const natureSymbolFromId = (id: number): string | undefined => Object.values(natures).find((n) => n.id === id)?.dbSymbol;

  const mapIncoming = (c: GiftCreature, isEgg: boolean): CreatureUIState => ({
    isEgg,
    id: c.id,
    level: c.level || 1,
    shiny: shinyToChoice(c.shiny),
    form: c.form || 0,
    gender: typeof c.gender === 'number' ? String(c.gender) : c.gender,
    nature: typeof c.nature === 'number' ? natureSymbolFromId(c.nature) : c.nature,
    ability: typeof c.ability === 'string' ? c.ability : undefined,
    item: typeof c.item === 'string' ? c.item : undefined,
    given_name: c.given_name,
    moves: c.moves,
  });

  const [entries, setEntries] = useState<CreatureUIState[]>(() => {
    const combined = [
      ...initialCreatures.map((c) => mapIncoming(c, false)),
      ...initialEggs.map((e) => mapIncoming(e as GiftCreature, true)),
    ];
    return combined.length > 0 ? combined : [{ isEgg: false, id: '', level: 1, shiny: 'random', form: 0 }];
  });

  const addEntry = () => setEntries((prev) => [...prev, { isEgg: false, id: '', level: 1, shiny: 'random', form: 0 }]);

  const updateEntry = (idx: number, patch: Partial<CreatureUIState>) =>
    setEntries((prev) => prev.map((entry, i) => (i === idx ? { ...entry, ...patch } : entry)));

  const removeEntry = (idx: number) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const validEntries = entries.filter((e) => e.id.trim().length > 0);

    const outCreatures: GiftCreature[] = [];
    const outEggs: GiftEgg[] = [];

    for (const e of validEntries) {
      // The server's mystery-gift schema demands NUMERIC ids for `gender` and
      // `nature`, even though our UI keeps them as strings (gender dropdown
      // values '1'/'2'; nature is a Studio dbSymbol). Convert at the save
      // boundary: gender → integer, nature → `StudioNature.id` looked up from
      // the project data. If the lookup fails we just omit the field rather
      // than send a string the server will reject.
      const genderNumeric = e.gender !== undefined && e.gender !== '' && !Number.isNaN(parseInt(e.gender, 10))
        ? parseInt(e.gender, 10)
        : undefined;
      const natureNumeric = e.nature && natures[e.nature] ? natures[e.nature].id : undefined;

      const base = {
        id: e.id.trim(),
        level: e.level,
        // Tri-state: explicit true/false go through, 'random' omits so PSDK rolls.
        ...((): { shiny?: boolean } => {
          const v = choiceToShiny(e.shiny);
          return v === undefined ? {} : { shiny: v };
        })(),
        ...(e.form > 0 ? { form: e.form } : {}),
        ...(genderNumeric !== undefined ? { gender: genderNumeric } : {}),
        ...(natureNumeric !== undefined ? { nature: natureNumeric } : {}),
        ...(e.ability ? { ability: e.ability } : {}),
      };

      if (e.isEgg) {
        outEggs.push(base);
      } else {
        const validMoves = e.moves?.filter((m) => m.trim().length > 0);
        outCreatures.push({
          ...base,
          ...(e.item ? { item: e.item } : {}),
          ...(e.given_name ? { given_name: e.given_name } : {}),
          ...(validMoves && validMoves.length > 0 ? { moves: validMoves } : {}),
        });
      }
    }

    onSave(outCreatures, outEggs);
  };

  return createPortal(
    <Overlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <ModalBox>
        <ModalTitle>{t('online_gift_creatures_and_eggs_title')}</ModalTitle>
        <ScrollArea>
          {entries.map((entry, idx) => (
            <CreatureCard key={idx}>
              <CardHeader>
                <h4>
                  #{idx + 1} — {entry.isEgg ? t('egg') : t('online_gift_card_creature')}
                </h4>
                <DeleteButtonOnlyIcon size="s" onClick={() => removeEntry(idx)} />
              </CardHeader>

              <PaddedInputContainer size="s">
                <InputWithLeftLabelContainer>
                  <Label>{t('egg')}</Label>
                  <Toggle checked={entry.isEgg} onChange={(e) => updateEntry(idx, { isEgg: e.target.checked })} />
                </InputWithLeftLabelContainer>

                <FieldGrid>
                  <InputWithTopLabelContainer>
                    <Label required>{t('online_gift_card_creature')}</Label>
                    <SelectPokemon
                      noLabel
                      dbSymbol={entry.id || '__undef__'}
                      onChange={(v) => updateEntry(idx, { id: v === '__undef__' ? '' : v, form: 0 })}
                      undefValueOption={t('none_option')}
                    />
                  </InputWithTopLabelContainer>

                  <InputWithTopLabelContainer>
                    <Label required>{t('level')}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={entry.level}
                      onChange={(e) => updateEntry(idx, { level: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                    />
                  </InputWithTopLabelContainer>
                </FieldGrid>

                <FieldGrid>
                  <InputWithTopLabelContainer>
                    <Label>{t('shiny')}</Label>
                    <StudioDropDown
                      value={entry.shiny}
                      options={shinyOptions}
                      onChange={(v) => updateEntry(idx, { shiny: v as ShinyChoice })}
                    />
                  </InputWithTopLabelContainer>

                  <InputWithTopLabelContainer>
                    <Label>{t('form')}</Label>
                    {entry.id ? (
                      <SelectPokemonForm
                        noLabel
                        dbSymbol={entry.id}
                        form={entry.form}
                        onChange={(v) => updateEntry(idx, { form: parseInt(v) || 0 })}
                      />
                    ) : (
                      <Input type="number" min="0" value={entry.form} onChange={(e) => updateEntry(idx, { form: parseInt(e.target.value) || 0 })} />
                    )}
                  </InputWithTopLabelContainer>
                </FieldGrid>

                <FieldGrid>
                  <InputWithTopLabelContainer>
                    <Label>{t('gender')}</Label>
                    <StudioDropDown
                      value={entry.gender ?? '0'}
                      options={genderOptions}
                      onChange={(v) => updateEntry(idx, { gender: v === '0' ? undefined : v })}
                    />
                  </InputWithTopLabelContainer>

                  <InputWithTopLabelContainer>
                    <Label>{t('nature')}</Label>
                    <SelectNature
                      dbSymbol={entry.nature ?? '__undef__'}
                      onChange={(opt) => updateEntry(idx, { nature: opt.value === '__undef__' ? undefined : opt.value })}
                      noneValue
                      overwriteNoneValue={t('none_option')}
                    />
                  </InputWithTopLabelContainer>
                </FieldGrid>

                <InputWithTopLabelContainer>
                  <Label>{t('ability')}</Label>
                  <SelectAbility
                    noLabel
                    dbSymbol={entry.ability || '__undef__'}
                    onChange={(v) => updateEntry(idx, { ability: v === '__undef__' ? undefined : v })}
                    undefValueOption={t('none_option')}
                  />
                </InputWithTopLabelContainer>

                {!entry.isEgg && (
                  <>
                    <InputWithTopLabelContainer>
                      <Label>{t('moves')}</Label>
                      <FieldGrid>
                        {[0, 1, 2, 3].map((mIdx) => (
                          <SelectMove
                            key={mIdx}
                            noLabel
                            dbSymbol={entry.moves?.[mIdx] || '__undef__'}
                            onChange={(val) => {
                              const newMoves = [...(entry.moves || ['', '', '', ''])];
                              newMoves[mIdx] = val === '__undef__' ? '' : val;
                              updateEntry(idx, { moves: newMoves });
                            }}
                            undefValueOption={t('none_option')}
                          />
                        ))}
                      </FieldGrid>
                    </InputWithTopLabelContainer>

                    <FieldGrid>
                      <InputWithTopLabelContainer>
                        <Label>{t('item_held')}</Label>
                        <SelectItem
                          noLabel
                          dbSymbol={entry.item || '__undef__'}
                          onChange={(v) => updateEntry(idx, { item: v === '__undef__' ? undefined : v })}
                          undefValueOption={t('none_option')}
                        />
                      </InputWithTopLabelContainer>

                      <InputWithTopLabelContainer>
                        <Label>{t('given_name')}</Label>
                        <Input
                          type="text"
                          placeholder="Sparky"
                          value={entry.given_name ?? ''}
                          onChange={(e) => updateEntry(idx, { given_name: e.target.value || undefined })}
                        />
                      </InputWithTopLabelContainer>
                    </FieldGrid>
                  </>
                )}
              </PaddedInputContainer>
            </CreatureCard>
          ))}
        </ScrollArea>
        <AddBar>
          <DarkButton onClick={addEntry}>{t('online_gift_add_creature')}</DarkButton>
        </AddBar>
        <ButtonBar>
          <DarkButton onClick={onCancel}>{t('cancel')}</DarkButton>
          <PrimaryButton onClick={handleSave}>{t('online_gift_modal_save')}</PrimaryButton>
        </ButtonBar>
      </ModalBox>
    </Overlay>,
    document.querySelector('#dialogs') || document.body,
  );
};
