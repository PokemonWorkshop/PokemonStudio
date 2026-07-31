import DownIcon from '@assets/icons/global/down-icon.svg';
import React from 'react';
import { RenderOptions } from './RenderOptions';
import { NodeSelectContainer } from './SelectContainer';
import { SelectProps, useSelect } from './useSelect';

export const NodeSelect = <Value extends string, ChooseValue extends string>(props: SelectProps<Value, ChooseValue>) => {
  const { onSelectValue, optionsUtilsRef, popoverRef, inputRef, outputRef, listRef, inputProps, outputProps } = useSelect(props);

  return (
    <NodeSelectContainer className={`nodrag nowheel ${props.className ?? ''}`}>
      <input type="text" ref={inputRef} {...inputProps} />
      <input type="hidden" ref={outputRef} {...outputProps} />
      <DownIcon className={`${inputProps.disabled ? 'disabled' : ''}`} />
      <RenderOptions onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </NodeSelectContainer>
  );
};
