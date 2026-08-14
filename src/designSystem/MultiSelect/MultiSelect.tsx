import DownIcon from '@assets/icons/global/down-icon.svg';
import React from 'react';
import { MultiSelectContainer, MultiSelectTextArea } from './MultiSelectContainer';
import { RenderOptions } from './RenderOptions';
import { MultiSelectProps, useMultiSelect } from './useMultiSelect';
import { ValueType } from './useRenderOptions';

export const MultiSelect = <Value extends ValueType, ChooseValue extends Value>(props: MultiSelectProps<Value, ChooseValue>) => {
  const { currentValues, onSelectValue, optionsUtilsRef, popoverRef, inputRef, listRef, inputProps } = useMultiSelect({
    ...props,
    chooseValue: (props.chooseValue as Value[]) ?? [],
  });

  const { name, ...textAreaProps } = inputProps;

  return (
    <MultiSelectContainer className={`${props.className ?? ''} ${inputProps.invalid ? 'invalid' : ''}`.trim()}>
      <MultiSelectTextArea readOnly ref={inputRef} {...textAreaProps} />
      {name && currentValues.map((val, i) => <input key={i} type="hidden" name={`${name}.${i}`} value={val.toString()} />)}
      <DownIcon id="downArrow" />
      <RenderOptions currentValues={currentValues} onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </MultiSelectContainer>
  );
};
