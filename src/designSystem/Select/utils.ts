import type { SelectOption } from './types';

export const findOptionIndexOrZero = <Value extends string>(options: Readonly<SelectOption<Value>[]>, currentValue: Value | undefined) =>
  Math.max(
    0,
    options.findIndex(({ value }) => value === currentValue)
  );

export const getSelectDefaultLabel = <Value extends string>(
  value: string | undefined,
  defaultValue: string | undefined,
  options: Readonly<SelectOption<Value>[]>,
  currentValue: Value | undefined,
  notFoundLabel: string | undefined
) => {
  if (!value && !defaultValue) return '';

  const optionIndex = findOptionIndexOrZero(options, currentValue);
  if (options.length > 0 && options[optionIndex].value === currentValue) {
    return options[optionIndex].label;
  }

  return notFoundLabel || '';
};

export const getNotFoundExclusionPattern = (notFoundLabel: string | undefined) => {
  if (!notFoundLabel) return undefined;

  const negativePattern = notFoundLabel.replace(/([\[\(\.\*\\\]\)\{\}])/g, '\\$1');
  return `^(?:(?!${negativePattern}).)+$`;
};

// Constant defining how much space we need to display a select
const SELECT_CLEARANCE = 195;
// Constant defining how far we put the select display from its input
const SELECT_SPACING = 4;
// Popover padding to take into account
const POPOVER_ADJUSTMENT = 10;

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
