import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectMove } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

export const MoveInput = ({ type, state, dispatch }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation();
  if (type !== 'skill1' && type !== 'skill2' && type !== 'skill3' && type !== 'skill4') return null;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolution_value_move')}</Label>
      <SelectMove dbSymbol={state[type]} onChange={(dbSymbol) => dispatch({ type: 'update', key: type, value: dbSymbol as DbSymbol })} noLabel />
    </InputWithTopLabelContainer>
  );
};
