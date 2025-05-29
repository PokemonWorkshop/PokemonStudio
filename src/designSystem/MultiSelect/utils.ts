import { TFunction } from 'i18next';
import type { MultiSelectOption } from './types';
import { ValueType } from './useRenderOptions';

export const findOptionIndices = <Value extends ValueType>(
  options: Readonly<MultiSelectOption<Value>[]>,
  currentValues: Value[]
): number[] =>
  options.reduce<number[]>((indices, { value }, index) => {
    if (currentValues?.includes(value)) {
      indices.push(index);
    }
    return indices;
  }, []);


export const findOptionIndexOrZero = <Value extends ValueType>(options: Readonly<MultiSelectOption<Value>[]>, currentValue: Value[] | undefined) =>
  Math.max(
    0,
    options.findIndex(({ value }) => currentValue?.includes(value))
  );

export const getSelectDefaultLabel = <Value extends ValueType, ChooseValue extends Value>(
  currentValues: Value[] | ChooseValue[],
  options: Readonly<MultiSelectOption<Value>[]> | Readonly<MultiSelectOption<ChooseValue>[]>,
  t: TFunction
): string => {
  const optionIndex = findOptionIndices(options, currentValues);
  if (options.length > 0) {
    return currentValues && currentValues.length
      ? optionIndex.map((index) => options[index]?.label).join(', ') || t?.('select')
      : t?.('select') || '';
  }

  return t?.('select');
};

export const getNotFoundExclusionPattern = (notFoundLabel: string | undefined) => {
  if (!notFoundLabel) return undefined;

  const negativePattern = notFoundLabel.replace(/([\[\(\.\*\\\]\)\{\}])/g, '\\$1');
  return `^(?:(?!${negativePattern}).)+$`;
};

// Constant defining how much space we need to display a select
const SELECT_CLEARANCE = 195;
// Constant defining how far we put the select display from its input
const SELECT_SPACING = 7;
// Popover padding to take into account
const POPOVER_ADJUSTMENT = 12;

export const positionAndShowPopover = (anchorElement: HTMLElement, popoverElement: HTMLDivElement) => {
  const clientPos = anchorElement.getBoundingClientRect();

  // TODO: Swap with CSS Anchor once it's available
  if (clientPos.top > window.innerHeight - SELECT_CLEARANCE - SELECT_SPACING) {
    popoverElement.style.top = '';
    popoverElement.style.bottom = `${clientPos.height + SELECT_SPACING}px`;
  } else {
    popoverElement.style.top = `${clientPos.height + SELECT_SPACING}px`;
    popoverElement.style.bottom = '';
  }
  popoverElement.style.width = `${clientPos.width - POPOVER_ADJUSTMENT}px`;
  popoverElement.style.maxHeight = `${SELECT_CLEARANCE}px`;
  popoverElement.classList.add('visible');
};
