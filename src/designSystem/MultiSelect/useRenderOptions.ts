import { RefObject, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import type { List } from 'react-virtualized/dist/es/List';
import type { MultiSelectOption, RenderOptionRef } from './types';
import { findOptionIndices } from './utils';

export type ValueType = string;
export type RenderOptionsProps<Value extends ValueType, ChooseValue extends Value> = {
  onSelectValue: (value: Value) => void;
  utils: RefObject<RenderOptionRef<Value, ChooseValue> | null>;
  popover: RefObject<HTMLDivElement | null>;
  listRef: RefObject<List | null>;
  currentValues: Value[] | ChooseValue[];
};

export const useRenderOptions = <Value extends ValueType, ChooseValue extends Value>({
  utils,
  onSelectValue,
  listRef,
  currentValues,
}: RenderOptionsProps<Value, ChooseValue>) => {
  const [options, setOptions] = useState<Readonly<MultiSelectOption<Value>[]>>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!options.length) return;

      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return prev + 1 >= options.length ? 0 : prev + 1;
        });
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => {
          if (prev === null) return options.length - 1;
          return prev - 1 < 0 ? options.length - 1 : prev - 1;
        });
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (selectedIndex !== null) {
          onSelectValue(options[selectedIndex].value);
        }
      }
    },
    [options, selectedIndex],
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      gotoRow(selectedIndex);
    }
  }, [selectedIndex]);

  const gotoRow = (idx: number) => {
    if (options[idx]) {
      const safeIndex = Math.max(0, Math.min(idx, options.length - 1));
      listRef.current?.scrollToRow(safeIndex);
    }
  };

  const handleMouseEnter = useCallback(() => {
    setSelectedIndex(null);
  }, []);

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
        setOptions(newOptions);
      },
      highlightNext: () => {
        if (!options) return;
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % options.length;
        });
      },
      highlightPrevious: () => {
        if (!options) return;
        setSelectedIndex((prev) => {
          if (prev === null) return options.length - 1;
          return (prev - 1 + options.length) % options.length;
        });
      },
      pickHighlighted: () => {
        if (selectedIndex !== null && options[selectedIndex]) {
          onSelectValue(options[selectedIndex].value);
        }
      },
    }),
    [setOptions, options, onSelectValue, selectedIndex, listRef, currentValues],
  );

  return { options, selectedIndex, setSelectedIndex, handleKeyDown, handleMouseEnter };
};
