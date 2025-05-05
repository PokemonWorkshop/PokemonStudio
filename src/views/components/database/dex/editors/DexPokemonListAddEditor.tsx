import React, { forwardRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { useProjectDex, useProjectPokemon } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { searchUnderAndEvolutions } from '@utils/dex';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDexPage } from '@hooks/usePage';
import { TooltipWrapper } from '@ds/Tooltip';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const getPokemonUnavailable = (dex: StudioDex): string[] => {
  return dex.creatures.map((creature) => creature.dbSymbol);
};

type DexPokemonListAddEditorProps = {
  // dex: StudioDex;
  onClose: () => void;
};

export const DexPokemonListAddEditor = forwardRef<EditorHandlingClose, DexPokemonListAddEditorProps>(({ onClose }, ref) => {
  const { setProjectDataValues: setDex } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const { dex } = useDexPage();
  const { t } = useTranslation();
  const pokemonList = useSelectOptions('creatures');
  const pokemonAvailable = useMemo(() => {
    const unavailable = getPokemonUnavailable(dex);
    return pokemonList.filter(({ value }) => !unavailable.includes(value));
  }, [dex]);
  const [creature, setCreature] = useState<StudioDexCreature>({ dbSymbol: (pokemonAvailable[0]?.value || '__undef__') as DbSymbol, form: 0 });
  const [isAddingEvolutions, setIsAddingEvolutions] = useState(false);

  useEditorHandlingClose(ref);

  const onClickAdd = () => {
    const newDex = { ...dex, creatures: [] as StudioDexCreature[] };
    const pokemonForm = isAddingEvolutions && allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
    const creatures = pokemonForm ? searchUnderAndEvolutions(pokemonForm, creature, allPokemon) : [creature];
    const alreadyInCreatures = dex.creatures.map(({ dbSymbol }) => dbSymbol);
    const creaturesToAdd = creatures
      .filter((other) => !alreadyInCreatures.includes(other.dbSymbol))
      .filter((dexc, i, self) => self.findIndex((c) => c.dbSymbol === dexc.dbSymbol) === i);
    if (creaturesToAdd.length !== 0) {
      newDex.creatures = [...dex.creatures, ...creaturesToAdd];
      setDex({ [dex.dbSymbol]: newDex });
    }
    onClose();
  };

  return (
    <Editor type="addition" title={t('creature')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('creature')}
            </Label>
            <StudioDropDown
              value={creature.dbSymbol}
              options={pokemonAvailable}
              onChange={(value) => setCreature({ ...creature, dbSymbol: value as DbSymbol })}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && allPokemon[creature.dbSymbol].forms.length > 1 && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('form')}</Label>
              <SelectPokemonForm
                dbSymbol={creature.dbSymbol}
                form={creature.form}
                onChange={(value) => setCreature({ ...creature, form: Number(value) })}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
        </InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="add_evolution">{t('add_all_evolution')}</Label>
          <Toggle name="add_evolution" checked={isAddingEvolutions} onChange={(event) => setIsAddingEvolutions(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={creature.dbSymbol === '__undef__' ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickAdd} disabled={creature.dbSymbol === '__undef__'}>
              {t('add_a_creature')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});

DexPokemonListAddEditor.displayName = 'DexPokemonListAddEditor';
