import { useState, useImperativeHandle, RefObject } from 'react';
import type { RenderOptionRef, SelectOption } from './types';
import { findOptionIndexOrZero } from './utils';
import type { List } from 'react-virtualized/dist/es/List';

export type RenderOptionsProps<Value extends string, ChooseValue extends string> = {
  onSelectValue: (value: Value) => void;
  utils: RefObject<RenderOptionRef<Value, ChooseValue>>;
  popover: RefObject<HTMLDivElement>;
  listRef: RefObject<List>;
};

export const useRenderOptions = <Value extends string, ChooseValue extends string>({
  utils,
  onSelectValue,
  listRef,
}: RenderOptionsProps<Value, ChooseValue>) => {
  const [options, setOptions] = useState<Readonly<SelectOption<Value>[]> | undefined>();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<Value | ChooseValue | undefined>();

  useImperativeHandle(
    utils,
    () => ({
      show: (value, options) => {
        setCurrentValue(value);
        setOptions(options);
        const newHighlightIndex = findOptionIndexOrZero(options, value);
        setHighlightIndex(newHighlightIndex);
        setTimeout(() => listRef.current?.scrollToRow(newHighlightIndex), 0);
      },
      hide: () => setOptions(undefined),
      refine: (newOptions) => {
        if (newOptions.length === 0) return;

        const newHighlightIndex = options ? Math.max(0, newOptions.indexOf(options[highlightIndex])) : 0;
        setOptions(newOptions);
        setHighlightIndex(newHighlightIndex);
        listRef.current?.scrollToRow(newHighlightIndex);
      },
      highlightNext: () => {
        if (!options) return;

        const newHighlightIndex = highlightIndex === options.length - 1 ? highlightIndex : highlightIndex + 1;
        setHighlightIndex(newHighlightIndex);
        listRef.current?.scrollToRow(newHighlightIndex);
      },
      highlightPrevious: () => {
        const newHighlightIndex = highlightIndex === 0 ? 0 : highlightIndex - 1;
        setHighlightIndex(newHighlightIndex);
        listRef.current?.scrollToRow(newHighlightIndex);
      },
      pickHighlighted: () => options && onSelectValue(options[highlightIndex].value),
    }),
    [setHighlightIndex, options, onSelectValue, highlightIndex]
  );

  return { options, highlightIndex, currentValue };
};
