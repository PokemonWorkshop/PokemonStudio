import React from 'react';
import { RenderOptions } from './RenderOptions';
import { MultiSelectProps, useMultiSelect } from './useMultiSelect';
import { MultiSelectContainer, MultiSelectTextArea } from './MultiSelectContainer';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { ValueType } from './useRenderOptions';

export const MultiSelect = <Value extends ValueType, ChooseValue extends Value>(props: MultiSelectProps<Value, ChooseValue>) => {
  const { currentValues, onSelectValue, optionsUtilsRef, popoverRef, inputRef, listRef, inputProps } = useMultiSelect({
    ...props,
    chooseValue: (props.chooseValue as Value[]) ?? [],
  });

  return (
    <MultiSelectContainer className={`${props.className ?? ''} ${inputProps.invalid ? 'invalid' : ''}`.trim()}>
      <MultiSelectTextArea readOnly ref={inputRef} tabIndex={0} {...inputProps} />
      <DownIcon id="downArrow" />
      <RenderOptions currentValues={currentValues} onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </MultiSelectContainer>
  );
};
