import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectMove } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

type MoveInputProps = InputProps & { currentType: 'skill1' | 'skill2' | 'skill3' | 'skill4' };

export const MoveInput = ({ condition, index, onChange, currentType }: MoveInputProps) => {
  const { t } = useTranslation('database_pokemon');
  if (condition.type !== currentType) return <></>;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolutionValue_move')}</Label>
      <SelectMove dbSymbol={condition.value} onChange={(option) => onChange({ type: currentType, value: option.value as DbSymbol }, index)} noLabel />
    </InputWithTopLabelContainer>
  );
};
