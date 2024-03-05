import React from 'react';
import { RenderOptions } from './RenderOptions';
import { SelectProps, useSelect } from './useSelect';
import { SelectContainer } from './SelectContainer';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';

export const Select = <Value extends string, ChooseValue extends string>(props: SelectProps<Value, ChooseValue>) => {
  const { onSelectValue, optionsUtilsRef, popoverRef, inputRef, outputRef, listRef, inputProps, outputProps } = useSelect(props);

  return (
    <SelectContainer>
      <input type="text" ref={inputRef} {...inputProps} />
      <input type="hidden" ref={outputRef} {...outputProps} />
      <DownIcon />
      <RenderOptions onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </SelectContainer>
  );
};
