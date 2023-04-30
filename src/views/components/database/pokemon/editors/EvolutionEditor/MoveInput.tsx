import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectMove } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

export const MoveInput = ({ type, state, dispatch }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation('database_pokemon');
  if (type !== 'skill1' && type !== 'skill2' && type !== 'skill3' && type !== 'skill4') return null;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolutionValue_move')}</Label>
      <SelectMove dbSymbol={state[type]} onChange={(option) => dispatch({ type: 'update', key: type, value: option.value as DbSymbol })} noLabel />
    </InputWithTopLabelContainer>
  );
};
