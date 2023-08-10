import React, { forwardRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { useProjectDex, useProjectPokemon } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { searchUnderAndEvolutions } from '@utils/dex';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSelectOptions } from '@utils/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDexPage } from '@utils/usePage';

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
  const { t } = useTranslation(['database_dex', 'database_pokemon', 'database_moves', 'select']);
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
    <Editor type="addition" title={t('database_pokemon:pokemon')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('database_pokemon:pokemon')}
            </Label>
            <StudioDropDown
              value={creature.dbSymbol}
              options={pokemonAvailable}
              onChange={(value) => setCreature({ ...creature, dbSymbol: value as DbSymbol })}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && allPokemon[creature.dbSymbol].forms.length > 1 && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
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
          <Label htmlFor="add_evolution">{t('database_dex:add_all_evolution')}</Label>
          <Toggle name="add_evolution" checked={isAddingEvolutions} onChange={(event) => setIsAddingEvolutions(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {creature.dbSymbol === '__undef__' && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickAdd} disabled={creature.dbSymbol === '__undef__'}>
              {t('database_dex:add_the_pokemon')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_dex:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});

DexPokemonListAddEditor.displayName = 'DexPokemonListAddEditor';
