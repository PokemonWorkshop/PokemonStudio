import { useState, useImperativeHandle, RefObject, useEffect } from 'react';
import type { RenderOptionRef, MultiSelectOption } from './types';
import { findOptionIndices } from './utils';
import type { List } from 'react-virtualized/dist/es/List';

export type ValueType = string;
export type RenderOptionsProps<Value extends ValueType, ChooseValue extends Value> = {
  onSelectValue: (value: Value) => void;
  utils: RefObject<RenderOptionRef<Value, ChooseValue>>;
  popover: RefObject<HTMLDivElement>;
  listRef: RefObject<List>;
  currentValues: Value[] | ChooseValue[];
};

export const useRenderOptions = <Value extends ValueType, ChooseValue extends Value>({
  utils,
  onSelectValue,
  listRef,
  currentValues,
}: RenderOptionsProps<Value, ChooseValue>) => {
  const [options, setOptions] = useState<Readonly<MultiSelectOption<Value>[]>>([]);
  const [highlightIndex, setHighlightIndex] = useState<number[]>([]);

  useEffect(() => {
    if (options.length === 0 || currentValues.length === 0) return;

    const newHighlightIndexes = findOptionIndices(options, currentValues as Value[]);
    setHighlightIndex(newHighlightIndexes);
  }, [currentValues, options]);

  useImperativeHandle(
    utils,
    () => ({
      show: (values, options) => {
        const validValues = (values ?? []) as Value[];
        setOptions(options);
        const newHighlightIndexes = findOptionIndices(options, validValues);
        setTimeout(() => newHighlightIndexes.forEach((index) => listRef.current?.scrollToRow(index)), 0);
      },
      hide: () => setOptions([]),
      refine: (newOptions) => {
        if (newOptions.length === 0) return;

        const newHighlightIndexes = options ? findOptionIndices(newOptions, currentValues) : [0];
        setOptions(newOptions);
        newHighlightIndexes.forEach((index) => listRef.current?.scrollToRow(index));
      },
      highlightNext: () => {
        if (!options) return;

        const lastIndex = options.length - 1;
        const newIndexes = highlightIndex.map((index) => (index < lastIndex ? index + 1 : index));
        setHighlightIndex(newIndexes);
      },
      highlightPrevious: () => {
        const newHighlightIndex = highlightIndex.map((r) => (r > 0 ? r - 1 : 0));
        setHighlightIndex(newHighlightIndex);
      },
      pickHighlighted: () => options && onSelectValue(options[highlightIndex[0]]?.value ?? []),
    }),
    [setHighlightIndex, options, onSelectValue, highlightIndex]
  );

  return { options, highlightIndex };
};
