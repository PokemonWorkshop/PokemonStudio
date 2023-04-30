import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';

export const PokemonInput = ({ type, state, dispatch }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation(['database_pokemon', 'select']);
  if (type !== 'tradeWith') return null;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('database_pokemon:evolutionValue_pokemon')}</Label>
      <SelectPokemon
        dbSymbol={state[type]}
        onChange={(value) => dispatch({ type: 'update', key: type, value: value as DbSymbol })}
        undefValueOption={t('select:none')}
        noLabel
      />
    </InputWithTopLabelContainer>
  );
};
