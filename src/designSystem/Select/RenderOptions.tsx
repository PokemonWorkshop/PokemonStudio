import List, { ListRowProps } from 'react-virtualized/dist/es/List';
import { SelectOption } from './types';
import { RenderOptionsProps, useRenderOptions } from './useRenderOptions';
import React, { MouseEventHandler } from 'react';

const CLASSES = ['option', 'option highlighted', 'option current', 'option highlighted current'];

const getClassName = (option: SelectOption<string>, currentValue: string | undefined, index: number, highlightIndex: number) => {
  if (index === highlightIndex) {
    return CLASSES[option.value === currentValue ? 3 : 1];
  }
  return CLASSES[option.value === currentValue ? 2 : 0];
};

const LIST_STYLE = { height: 'auto', maxHeight: '195px' };

const allowScroll: MouseEventHandler<HTMLDivElement> = (event) => {
  if (event.target instanceof HTMLElement && event.target.tagName === 'DIV') {
    event.preventDefault();
  }
};

export const RenderOptions = <Value extends string, ChooseValue extends string>(props: RenderOptionsProps<Value, ChooseValue>) => {
  const { options, highlightIndex, currentValue } = useRenderOptions(props);

  const rowRenderer = ({ style, index, key }: ListRowProps) => {
    if (!options) return null;
    const option = options[index];
    return (
      <span
        key={key}
        className={getClassName(option, currentValue, index, highlightIndex)}
        onMouseDown={(e) => {
          e.preventDefault();
          props.onSelectValue(option.value);
        }}
        data-tool-tip={option.tooltip}
        style={style}
      >
        {option.label}
      </span>
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
        />
      ) : null}
    </div>
  );
};
RenderOptions.displayName = 'RenderOptions';
