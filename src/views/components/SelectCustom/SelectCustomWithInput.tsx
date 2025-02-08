import React, { useMemo, useState } from 'react';
import { InputContainer, InputWithLeftLabelContainer, Label, Input, InputWithTopLabelContainer } from '@components/inputs';
import { DropDownOption, StudioDropDown } from '@components/StudioDropDown';
import { Select } from '@ds/Select';

type SelectCustomWithInputProps = {
  value: string;
  selectCustomLabel: string;
  zodFormName?: string;
  onSelectValueChange: (value: string) => void;
  inputLabel: string;
  defaultCustomValue: string;
  setCustomValue: (value: string) => void;
  selectOptions: DropDownOption[];
  isTopLabel?: boolean;
};

export const SelectCustomWithInput = ({
  value,
  selectCustomLabel,
  zodFormName,
  onSelectValueChange,
  inputLabel,
  defaultCustomValue,
  setCustomValue,
  selectOptions,
  isTopLabel,
}: SelectCustomWithInputProps) => {
  const options = useMemo(() => {
    return [...selectOptions, { label: selectCustomLabel, value: 'custom' }];
  }, [selectOptions, selectCustomLabel]);
  window.console.log(value);
  const [isCustom, setIsCustom] = useState(!options.some((option) => option.value === value));

  const handleBlurInput = (value: string) => {
    if (options.find((option) => option.value === value)) {
      onSelectValueChange(value);
      setIsCustom(false);
    }
    setCustomValue(value);
  };

  return (
    <InputContainer size="s">
      <Select
        name={isCustom ? '__ignore__' : zodFormName}
        value={value}
        options={options}
        onChange={(value) => {
          setIsCustom(value === 'custom');
          onSelectValueChange(value);
        }}
      />
      {isCustom &&
        (isTopLabel ? (
          <InputWithTopLabelContainer>
            <Label htmlFor="input">{inputLabel}</Label>
            <Input
              type="string"
              name={zodFormName || 'custom'}
              defaultValue={defaultCustomValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onBlur={(event) => handleBlurInput(event.target.value)}
            />
          </InputWithTopLabelContainer>
        ) : (
          <InputWithLeftLabelContainer>
            <Label htmlFor="input">{inputLabel}</Label>
            <Input
              type="number"
              name={zodFormName || 'custom'}
              defaultValue={defaultCustomValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onBlur={(event) => handleBlurInput(event.target.value)}
            />
          </InputWithLeftLabelContainer>
        ))}
    </InputContainer>
  );
};
