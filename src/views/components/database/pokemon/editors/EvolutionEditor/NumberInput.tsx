import { InputWithLeftLabelContainer, Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TextInputError } from '@components/inputs/Input';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

type NumberInputProps = InputProps & {
  currentType: 'maxLevel' | 'minLevel' | 'maxLoyalty' | 'minLoyalty' | 'env';
  min: number;
  max?: number;
  label: string;
};

export const NumberInput = ({ condition, index, onChange, currentType, min, max, label }: NumberInputProps) => {
  const { t } = useTranslation('database_pokemon');
  const [currentValue, setCurrentValue] = useState(condition.value?.toString() || '');
  const [error, setError] = useState(false);

  if (condition.type !== currentType) return <></>;

  const onBlur = () => {
    const inputValue = Number(currentValue);
    if (isFinite(inputValue)) {
      const minClamped = inputValue < min ? min : inputValue;
      const value = max && minClamped > max ? max : minClamped;
      onChange({ type: currentType, value }, index);
    } else {
      onChange({ type: currentType, value: min }, index);
    }
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setCurrentValue(event.target.value);
    const inputValue = Number(event.target.value);
    if (event.target.value.length === 0 || inputValue < min || (max && inputValue > max)) {
      setError(true);
      return;
    } else if (error) {
      setError(false);
    }
    onChange({ type: currentType, value: inputValue }, index);
  };

  return (
    <InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label>{label}</Label>
        <Input type="number" value={currentValue} onChange={onInputChange} onBlur={onBlur} />
      </InputWithLeftLabelContainer>
      {error && <TextInputError>{max ? t('numberInputErrorMinMax', { min, max }) : t('numberInputErrorMin', { min })}</TextInputError>}
    </InputWithTopLabelContainer>
  );
};
