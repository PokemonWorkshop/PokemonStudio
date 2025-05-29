import React, { useEffect } from 'react';
import List, { ListRowProps } from 'react-virtualized/dist/es/List';
import { RenderOptionsProps, useRenderOptions, ValueType } from './useRenderOptions';
import { Checkbox } from '@components/Checkbox';
import { Option } from './MultiSelectContainer';
import { defaultSelectAllValue } from './useMultiSelect';

const LIST_STYLE = { height: 'auto', maxHeight: '195px' };

export const RenderOptions = <Value extends ValueType, ChooseValue extends Value>(props: RenderOptionsProps<Value, ChooseValue>) => {
  const { options, selectedIndex, handleKeyDown, handleMouseEnter } = useRenderOptions(props);

  useEffect(() => {
    const listElement = props.popover;
    if (!listElement) return;

    const rows = listElement.current?.querySelectorAll<HTMLElement>('.ReactVirtualized__Grid__innerScrollContainer > div');
    rows?.forEach((row: HTMLElement, index: number) => {
      if (selectedIndex === index) {
        row.classList.add('highlighted');
      } else {
        row.classList.remove('highlighted');
      }
    });
  }, [selectedIndex, props.listRef]);

  const rowRenderer = ({ style, index, key }: ListRowProps) => {
    if (!options) return null;
    const option = options[index];
    const totalOptionsCount = options.length - 1;
    const isChecked = props.currentValues.includes(option.value as ChooseValue);
    const isAll = option.value === defaultSelectAllValue;
    const isAllChecked = props.currentValues.length === totalOptionsCount;
    const hasSomeChecked = props.currentValues.length > 0 && props.currentValues.length < totalOptionsCount;

    const className = selectedIndex === index ? 'option highlighted' : 'option';

    return (
      <Option
        key={key}
        className={className}
        onMouseDown={(e) => {
          e.preventDefault();
          props.onSelectValue(option.value);
        }}
        onMouseEnter={() => handleMouseEnter()}
        data-tooltip={option.tooltip}
        style={style}
      >
        <Checkbox
          checked={isChecked || (isAll && isAllChecked)}
          indeterminate={isAll && !isChecked && hasSomeChecked}
          onChange={(e) => {
            e.preventDefault();
          }}
          className="checkbox"
        />
        <span>{option.label}</span>
      </Option>
    );
  };

  return (
    <div className="select-popover" ref={props.popover} tabIndex={0} onKeyDown={handleKeyDown}>
      {options ? (
        <List
          ref={props.listRef}
          className="select-list"
          height={195}
          rowHeight={39}
          rowCount={options.length}
          rowRenderer={rowRenderer}
          width={(props.popover.current?.clientWidth || 0) - (options.length > 5 ? 12 : 8)}
          style={LIST_STYLE}
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
};
RenderOptions.displayName = 'RenderOptions';
