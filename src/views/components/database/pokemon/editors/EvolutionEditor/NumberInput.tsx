import { InputWithLeftLabelContainer, Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TextInputError } from '@components/inputs/Input';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

type NumberInputProps = EvolutionConditionEditorInput & {
  min: number;
  max?: number;
  label: string;
};

const validInputs = ['maxLevel', 'minLevel', 'maxLoyalty', 'minLoyalty', 'env'] as const;
type NumberType = (typeof validInputs)[number];
const isTypeValidInput = (type: unknown): type is NumberType => validInputs.includes(type as NumberType);

export const NumberInput = ({ state, inputRefs, type, min, max, label }: NumberInputProps) => {
  const { t } = useTranslation('database_pokemon');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isTypeValidInput(type)) return;

    const ref = inputRefs.current[type];
    if (!ref) return;

    ref.value = state.defaults[type]?.toString() || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!isTypeValidInput(type)) return null;

  const value = state.defaults[type];

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = Number(event.target.value);
    if (event.target.value.length === 0 || inputValue < min || (max && inputValue > max)) {
      setError(true);
      return;
    } else if (error) {
      setError(false);
    }
  };

  return (
    <InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label>{label}</Label>
        <Input
          type="number"
          min={min}
          max={max}
          step={1}
          ref={(ref) => (inputRefs.current[type] = ref)}
          defaultValue={value?.toString()}
          onChange={onInputChange}
          required
        />
      </InputWithLeftLabelContainer>
      {error && <TextInputError>{max ? t('numberInputErrorMinMax', { min, max }) : t('numberInputErrorMin', { min })}</TextInputError>}
    </InputWithTopLabelContainer>
  );
};
