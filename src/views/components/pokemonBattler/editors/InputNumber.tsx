import React, { forwardRef, useMemo } from 'react';
import { Input } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';

type InputNumberProps = {
  name: string;
  defaultValue: number;
  min: string | number;
  max: string | number;
  onChange: (value: number) => void;
};

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(({ name, defaultValue, min, max, onChange }, ref) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveDefaultValue = useMemo(() => (isNaN(defaultValue) ? '' : defaultValue), []);
  return (
    <Input
      type="number"
      name={name}
      min={min}
      max={max}
      defaultValue={saveDefaultValue}
      onChange={(event) => onChange(event.target.valueAsNumber)}
      ref={ref}
    />
  );
});
InputNumber.displayName = 'InputNumber';

type InputNumberStatsProps = Omit<InputNumberProps, 'min' | 'max'>;

export const InputNumberStats = forwardRef<HTMLInputElement, InputNumberStatsProps>(({ name, defaultValue, onChange }, ref) => {
  return <InputNumber name={name} defaultValue={defaultValue} min="0" max="9999" onChange={onChange} ref={ref} />;
});
InputNumberStats.displayName = 'InputNumberStats';

type EmbeddedUnitInputNumberProps = InputNumberProps & { unit: string };

export const EmbeddedUnitInputNumber = forwardRef<HTMLInputElement, EmbeddedUnitInputNumberProps>(
  ({ name, defaultValue, min, max, unit, onChange }, ref) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const saveDefaultValue = useMemo(() => (isNaN(defaultValue) ? '' : defaultValue), []);
    return (
      <EmbeddedUnitInput
        type="number"
        name={name}
        min={min}
        max={max}
        unit={unit}
        defaultValue={saveDefaultValue}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        ref={ref}
      />
    );
  }
);
EmbeddedUnitInputNumber.displayName = 'EmbeddedUnitInputNumber';
