import React, { useMemo, useState } from 'react';
import { InputContainer, InputWithLeftLabelContainer, Label, Input, InputWithTopLabelContainer } from '@components/inputs';
import { DropDownOption } from '@components/StudioDropDown';
import { Select } from '@ds/Select';

type SelectCustomWithInputProps = {
  value: string;
  selectCustomLabel: string;
  zodFormName?: string;
  onSelectValueChange: (value: string) => void;
  inputLabel: string;
  minInput?: string;
  maxInput?: string;
  inputPattern?: string;
  defaultCustomValue: string | undefined;
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
  minInput,
  maxInput,
  inputPattern,
  defaultCustomValue,
  setCustomValue,
  selectOptions,
  isTopLabel,
}: SelectCustomWithInputProps) => {
  const options = useMemo(() => {
    return [...selectOptions, { label: selectCustomLabel, value: 'custom' }];
  }, [selectOptions, selectCustomLabel]);
  const [isCustom, setIsCustom] = useState(!selectOptions.some((option) => option.value === value));
  const [selectValue, setSelectValue] = useState(isCustom ? 'custom' : selectOptions.find((option) => option.value === value)?.value);
  const InputContainerComponent = isTopLabel ? InputWithTopLabelContainer : InputWithLeftLabelContainer;

  const handleSelectChange = (value: string) => {
    setIsCustom(value === 'custom');
    setSelectValue(options.find((option) => option.value === value)?.value);
    onSelectValueChange(value);
  };

  const handleBlur = (value: string) => {
    if (selectOptions.find((option) => option.value === value)) {
      setSelectValue(selectOptions.find((option) => option.value === value)?.value);
      onSelectValueChange(value);
      setIsCustom(false);
    } else {
      setIsCustom(true);
    }
    setCustomValue(value);
  };

  return (
    <InputContainer size="s">
      <Select name={isCustom ? '__ignore__' : zodFormName} value={selectValue} options={options} onChange={(value) => handleSelectChange(value)} />
      {isCustom && (
        <InputContainerComponent>
          <Label required>{inputLabel}</Label>
          <Input
            type={isTopLabel ? 'string' : 'number'}
            name={isCustom ? zodFormName : '__ignore__'}
            min={minInput}
            max={maxInput}
            defaultValue={defaultCustomValue}
            pattern={inputPattern}
            onChange={(event) => setCustomValue(event.target.value)}
            onBlur={(event) => handleBlur(event.target.value)}
          />
        </InputContainerComponent>
      )}
    </InputContainer>
  );
};
