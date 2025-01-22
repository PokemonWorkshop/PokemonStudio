import React, { forwardRef } from 'react';
import { Input } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type InputNumberProps = {
  name: string;
  value: number;
  max?: number;
  setValue: (value: number) => void;
};

export const InputNumber = ({ name, value, max, setValue }: InputNumberProps) => {
  return (
    <Input
      type="number"
      name={name}
      min="1"
      max={max ?? 999}
      value={isNaN(value) ? '' : value}
      onChange={(event) => {
        const newValue = event.target.value == '' ? Number.NaN : parseInt(event.target.value);
        if (newValue < 1 || newValue > (max ?? 999)) return event.preventDefault();
        setValue(newValue);
      }}
      onBlur={(event) => setValue(cleanNaNValue(event.target.valueAsNumber, 1))}
    />
  );
};

type InputNumber2Props = {
  name: string;
  defaultValue: number;
  onChange: () => void;
};

export const InputNumber2 = forwardRef<HTMLInputElement, InputNumber2Props>(({ name, defaultValue, onChange }, ref) => {
  return <Input ref={ref} type="number" name={name} min="1" max="999" defaultValue={defaultValue} onChange={onChange} />;
});
InputNumber2.displayName = 'InputNumber2';
