import React from 'react';
import { Input } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type InputNumberProps = {
  name: string;
  value: number;
  setValue: (value: number) => void;
};

export const InputNumber = ({ name, value, setValue }: InputNumberProps) => {
  return (
    <Input
      type="number"
      name={name}
      min="1"
      max="999"
      value={isNaN(value) ? '' : value}
      onChange={(event) => {
        const newValue = event.target.value == '' ? Number.NaN : parseInt(event.target.value);
        if (newValue < 1 || newValue > 999) return event.preventDefault();
        setValue(newValue);
      }}
      onBlur={() => setValue(cleanNaNValue(value, 1))}
    />
  );
};
