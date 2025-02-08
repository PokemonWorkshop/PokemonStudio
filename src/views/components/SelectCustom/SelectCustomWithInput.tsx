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
  const [isCustom, setIsCustom] = useState(!selectOptions.some((option) => option.value === value));
  const [selectValue, setSelectValue] = useState(isCustom ? 'custom' : selectOptions.find((option) => option.value === value)?.value);

  const handleOnChangeSelect = (value: string) => {
    setIsCustom(value === 'custom');
    setSelectValue(options.find((option) => option.value === value)?.value);
    onSelectValueChange(value);
  };

  const handleBlurInput = (value: string) => {
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
      <Select
        name={isCustom ? '__ignore__' : zodFormName}
        //value={isCustom ? 'custom' : value}
        value={selectValue}
        options={options}
        onChange={(value) => handleOnChangeSelect(value)}
      />
      {isCustom &&
        (isTopLabel ? (
          <InputWithTopLabelContainer>
            <Label>{inputLabel}</Label>
            <Input
              type="string"
              name={isCustom ? zodFormName : '__ignore__'}
              defaultValue={defaultCustomValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onBlur={(event) => handleBlurInput(event.target.value)}
            />
          </InputWithTopLabelContainer>
        ) : (
          <InputWithLeftLabelContainer>
            <Label>{inputLabel}</Label>
            <Input
              type="number"
              name={isCustom ? zodFormName : '__ignore__'}
              defaultValue={defaultCustomValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onBlur={(event) => handleBlurInput(event.target.value)}
            />
          </InputWithLeftLabelContainer>
        ))}
    </InputContainer>
  );
};
