import List, { ListRowProps } from 'react-virtualized/dist/es/List';
import { MultiSelectOption } from './types';
import { RenderOptionsProps, useRenderOptions, ValueType } from './useRenderOptions';
import React, { MouseEventHandler, useEffect } from 'react';
import { Checkbox } from '@components/Checkbox';
import { Option } from './MultiSelectContainer';

const CLASSES = ['option', 'option highlighted', 'option current', 'option highlighted current'];


const getClassName = (option: MultiSelectOption<ValueType>, currentValues: ValueType[], index: number, highlightIndex: number[]) => {
  const isCurrentValue = currentValues.includes(option.value);
  if (highlightIndex.includes(index)) {
    return CLASSES[isCurrentValue ? 3 : 1];
  }
  return CLASSES[isCurrentValue ? 2 : 0];
};

const LIST_STYLE = { height: 'auto', maxHeight: '195px' };

const allowScroll: MouseEventHandler<HTMLDivElement> = (event) => {
  if (event.target instanceof HTMLElement && event.target.tagName === 'DIV') {
    event.preventDefault();
  }
};

export const RenderOptions = <Value extends ValueType, ChooseValue extends Value>(props: RenderOptionsProps<Value, ChooseValue>) => {
  const { options, highlightIndex } = useRenderOptions(props);

  const rowRenderer = ({ style, index, key }: ListRowProps) => {
    if (!options) return null;
    const option = options[index];
    const totalOptionsCount = options.length - 1;
    const isChecked = props.currentValues.includes(option.value as ChooseValue);
    const isAll = option.value === 'ALL';
    const isAllChecked = props.currentValues.length === totalOptionsCount;
    const hasSomeChecked = props.currentValues.length > 0 && props.currentValues.length < totalOptionsCount;

    return (
      <Option
        key={key}
        className={getClassName(option, props.currentValues, index, highlightIndex)}
        onMouseDown={(e) => {
          e.preventDefault();
          props.onSelectValue(option.value);
        }}
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
    <div className="select-popover" ref={props.popover} onMouseDown={allowScroll}>
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
