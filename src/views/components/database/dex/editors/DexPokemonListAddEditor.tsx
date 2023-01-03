import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { useProjectDex, useProjectPokemon } from '@utils/useProjectData';
import { SelectPokemon, SelectPokemonForm } from '@components/selects';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { searchUnderAndEvolutions } from '@utils/dex';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const getPokemonUnavailable = (dex: StudioDex): string[] => {
  return dex.creatures.map((creature) => creature.dbSymbol);
};

type DexPokemonListAddEditorProps = {
  dex: StudioDex;
  onClose: () => void;
};

export const DexPokemonListAddEditor = ({ dex, onClose }: DexPokemonListAddEditorProps) => {
  const { setProjectDataValues: setDex } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const [creature, setCreature] = useState<StudioDexCreature>({ dbSymbol: '__undef__' as DbSymbol, form: 0 });
  const pokemonUnavailable = useMemo(() => getPokemonUnavailable(dex), [dex]);
  const { t } = useTranslation(['database_dex', 'database_pokemon', 'database_moves']);
  const [isAddingEvolutions, setIsAddingEvolutions] = useState(false);

  const onClickAdd = () => {
    const newDex = { ...dex, creatures: [] as StudioDexCreature[] };
    const pokemonForm = isAddingEvolutions && allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
    const creatures = pokemonForm ? searchUnderAndEvolutions(pokemonForm, creature, allPokemon) : [creature];
    const alreadyInCreatures = dex.creatures.map(({ dbSymbol }) => dbSymbol);
    const creaturesToAdd = creatures.filter((other) => !alreadyInCreatures.includes(other.dbSymbol));
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
            <SelectPokemon
              dbSymbol={creature.dbSymbol}
              onChange={(selected) => setCreature({ ...creature, dbSymbol: selected.value as DbSymbol })}
              noLabel
              noneValue
              noneValueIsError
              rejected={pokemonUnavailable}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && allPokemon[creature.dbSymbol].forms.length > 1 && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
              <SelectPokemonForm
                dbSymbol={creature.dbSymbol}
                form={creature.form}
                onChange={(selected) => setCreature({ ...creature, form: Number(selected.value) })}
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
};
