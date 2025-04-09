import React, { useRef, useState } from 'react';
import { MultiSelect } from './MultiSelect';
import { SelectContainerWithLabel } from '@components/selects/SelectContainerWithLabel';

const genericOptions = [
  { value: 'value_a', label: 'Option A' },
  { value: 'value_b', label: 'Choice B' },
  { value: 'value_c', label: 'Very long stuff C that needs tooltip', tooltip: 'Very long stuff C that needs tooltip' },
  { value: 'value_d', label: 'Option D' },
  { value: 'value_e', label: 'Choice E' },
  { value: 'value_f', label: 'Choice F' },
  { value: 'value_g', label: 'Option G' },
] as const;
type GenericOption = (typeof genericOptions)[number];
type GenericOptionValue = GenericOption['value'];

export const MultiSelectExamples = () => {
  const [value1, setValue1] = useState<GenericOptionValue[]>(['value_c']);
  const ref1 = useRef([]);
  const bigOptions = Array.from({ length: 2000 }, (_, i) => ({ value: `value_${i}`, label: `Option ${i}` }));

  return (
    <div style={{ padding: '32px', width: '100%', overflow: 'auto' }}>
      <h2>MultiSelect</h2>
      <SelectContainerWithLabel>
        <span>Controlled</span>
        <MultiSelect value={value1} onChange={setValue1} options={genericOptions} />
        {value1.toString()}
        <button onClick={() => setValue1(['value_e'])}>Reset</button>
      </SelectContainerWithLabel>
      <br />
      <SelectContainerWithLabel>
        <span>Uncontrolled</span>
        <MultiSelect options={bigOptions} placeholder="Choose a value" optionRef={ref1} />
        <button onClick={() => alert(`Value: ${ref1.current}`)}>Show Value</button>
      </SelectContainerWithLabel>
    </div>
  );
};
