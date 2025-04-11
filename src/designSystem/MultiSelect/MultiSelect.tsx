import React from 'react';
import { RenderOptions } from './RenderOptions';
import { MultiSelectProps, useMultiSelect } from './useMultiSelect';
import { MultiSelectContainer, MultiSelectInput } from './MultiSelectContainer';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { ValueType } from './useRenderOptions';

export const MultiSelect = <Value extends ValueType, ChooseValue extends Value>(props: MultiSelectProps<Value, ChooseValue>) => {
  const { currentValues, onSelectValue, optionsUtilsRef, popoverRef, inputRef, outputRef, listRef, inputProps, outputProps } = useMultiSelect({
    ...props,
    chooseValue: (props.chooseValue as Value[]) ?? [],
  });

  return (
    <MultiSelectContainer className={`${props.className ?? ''} ${inputProps.invalid ? 'invalid' : ''}`.trim()}>
      <MultiSelectInput readOnly type="text" ref={inputRef} {...inputProps} />
      <MultiSelectInput readOnly type="hidden" ref={outputRef} {...outputProps} />
      <DownIcon id="downArrow" />
      <RenderOptions currentValues={currentValues} onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </MultiSelectContainer>
  );
};
