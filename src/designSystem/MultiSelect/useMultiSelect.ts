import {
  FocusEventHandler,
  InputHTMLAttributes,
  KeyboardEventHandler,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RenderOptionRef, MultiSelectOption } from './types';
import { findOptionIndices, getNotFoundExclusionPattern, getSelectDefaultLabel, positionAndShowPopover } from './utils';
import type { List } from 'react-virtualized/dist/es/List';
import { ValueType } from './useRenderOptions';
import { useTranslation } from 'react-i18next';

export type MultiSelectProps<Value extends ValueType, ChooseValue extends Value> = {
  options: Readonly<MultiSelectOption<Value>[]>;
  chooseValue?: ChooseValue[];
  notFoundLabel?: string;
  value?: Value[] | ChooseValue[];
  defaultValue?: Value[];
  optionRef?: React.MutableRefObject<Value[] | ChooseValue[]>;
  onChange?: (value: Value[]) => void;
  disabled?: boolean;
  selectAllOption?: {
    label: string;
  };
} & Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'min' | 'max' | 'value' | 'onChange' | 'type' | 'multiple' | 'list' | 'checked'>;

export const defaultSelectAllValue = 'ALL' as const;

export const useMultiSelect = <Value extends ValueType, ChooseValue extends Value>({
  options,
  chooseValue,
  notFoundLabel,
  value,
  defaultValue,
  optionRef,
  onChange,
  disabled: disabledFromOutside,
  selectAllOption,
  ...props
}: MultiSelectProps<Value, ChooseValue>) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const optionsUtilsRef = useRef<RenderOptionRef<Value, ChooseValue>>(null);
  const [currentValues, setCurrentValues] = useState(value ?? defaultValue ?? chooseValue ?? []);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const extendedOptions = useMemo(() => {
    if (!selectAllOption) return options;
    return [{ label: selectAllOption.label, value: defaultSelectAllValue as Value }, ...options];
  }, [options, selectAllOption]);
  const defaultInputValue = useMemo(() => getSelectDefaultLabel(currentValues, extendedOptions, t), [value]);
  const disabled = disabledFromOutside || options.length === 0;
  const [isInvalid, setIsInvalid] = useState(false);

  useImperativeHandle(optionRef, () => currentValues, [currentValues]);
  useEffect(() => {
    if (inputRef.current) {
      const concatenatedValues = currentValues.map((value) => value.toString()).join(', ');
      const optionIndex = findOptionIndices(extendedOptions, currentValues);
      const shouldShowTooltip = currentValues.length > 3;
      const tooltipContent = shouldShowTooltip ? optionIndex.map((index) => extendedOptions[index]?.label).join(', ') : '';
      inputRef.current.title = tooltipContent;
      inputRef.current.value = concatenatedValues;
    }
  }, [currentValues, defaultValue, value]);

  // Reset input value whenever defaultInputValue changes because defaultValue is definitive so value change can't be forwarded through defaultValue
  useEffect(() => {
    // If defaultInputValue did change, then current value must change
    if (value != currentValues && !defaultValue) {
      const newValue = value ?? chooseValue ?? [];
      setCurrentValues(newValue);
      resizeInput();
      if (inputRef.current) {
        const optionIndex = findOptionIndices(extendedOptions, newValue);
        const shouldShowTooltip = newValue.length > 3;
        const tooltipContent = shouldShowTooltip ? optionIndex.map((index) => extendedOptions[index]?.label).join(', ') : '';
        inputRef.current.title = tooltipContent;
        inputRef.current.value = getSelectDefaultLabel(newValue, extendedOptions, t);
      }
    }
  }, [value]);

  useEffect(() => {
    resizeInput();
  }, [currentValues]);

  // Select value again when options changes and main input visually change
  useEffect(() => {
    const newInputLabel = getSelectDefaultLabel(currentValues, extendedOptions, t);
    const currentInputLabel = inputRef.current?.value;
    if (newInputLabel !== currentInputLabel) {
      if (inputRef.current) inputRef.current.value = newInputLabel;
    }
  }, [extendedOptions, currentValues, defaultValue, t]);

  // Apply selected value
  const onSelectValue = (value: Value) => {
    let newValues: Value[] = [];
    const isAll = value === 'ALL';
    const isCurrentlyAll = currentValues.includes('ALL' as Value);

    if (isAll) {
      const allOptionValues = extendedOptions.map((opt) => opt.value).filter((v) => v !== 'ALL') as Value[];
      const isFullySelected = allOptionValues.every((val) => currentValues.includes(val));
      newValues = isFullySelected ? [] : allOptionValues;
    } else {
      newValues = isCurrentlyAll ? [value] : currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value];
    }

    setCurrentValues(newValues);
    onChange?.(newValues);
    validateSelection(newValues);

    if (inputRef.current) {
      const optionIndex = findOptionIndices(extendedOptions, newValues);
      const shouldShowTooltip = newValues.length > 3;
      const tooltipContent = shouldShowTooltip ? optionIndex.map((index) => extendedOptions[index]?.label).join(', ') : '';
      inputRef.current.title = tooltipContent;
      inputRef.current.value = getSelectDefaultLabel(newValues, extendedOptions, t);
    }
  };

  const resizeInput = () => {
    if (inputRef.current) {
      const content = inputRef.current.value;

      // Create a temporary div to estimate the height of the content
      const tempDiv = document.createElement('div');
      const inputStyles = window.getComputedStyle(inputRef.current);
      const totalPadding = parseInt(inputStyles.paddingLeft) + parseInt(inputStyles.paddingRight);
      const totalBorder = parseInt(inputStyles.borderLeftWidth) + parseInt(inputStyles.borderRightWidth);
      const verticalPadding = parseInt(inputStyles.paddingTop) + parseInt(inputStyles.paddingBottom);

      let width = inputRef.current.offsetWidth;
      if (width === 0) {
        const parentWidth = inputRef.current.parentElement?.offsetWidth;
        width = parentWidth || 180;
      }

      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.style.width = `${width - totalPadding - totalBorder}px`;
      tempDiv.style.font = inputStyles.font;
      tempDiv.style.lineHeight = inputStyles.lineHeight;
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.wordBreak = 'break-word';
      tempDiv.textContent = content;

      document.body.appendChild(tempDiv);
      const height = tempDiv.offsetHeight;
      document.body.removeChild(tempDiv);

      const estimatedHeight = Math.min(height + verticalPadding, 78);
      inputRef.current.style.height = `${estimatedHeight}px`;

      // Reposition the popover if it is visible
      if (popoverRef.current?.classList.contains('visible')) {
        positionAndShowPopover(inputRef.current, popoverRef.current);
      }
    }
  };

  // Initial resize with a small delay to ensure DOM is ready
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      resizeInput();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Resize on value changes
  useEffect(() => {
    resizeInput();
  }, [currentValues]);

  // Let the popover know what to show when the input gets focus
  const onFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    if (disabled || !popoverRef.current) return;

    const firstOption = popoverRef.current?.querySelector('.select-list span');
    if (firstOption) {
      (firstOption as HTMLElement).focus();
    }
  };

  // Handle click when input is already focused
  const onClick: React.MouseEventHandler<HTMLTextAreaElement> = (event) => {
    if (disabled || !popoverRef.current) return;

    if (popoverRef.current.classList.contains('visible')) {
      popoverRef.current.classList.remove('visible');
      optionsUtilsRef.current?.hide();
    } else {
      optionsUtilsRef.current?.show(Array.isArray(currentValues) ? currentValues : [currentValues], extendedOptions);
      positionAndShowPopover(event.currentTarget, popoverRef.current);
    }
  };

  // Hide the popover when it loses focus and revert text value to appropriate one
  const onBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    if (disabled || !popoverRef.current) return;

    optionsUtilsRef.current?.hide();
    popoverRef.current.classList.remove('visible');
  };

  // Handle navigation in select elements
  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (disabled) return;

    if (event.key !== 'Enter' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    switch (event.key) {
      case 'Enter':
        optionsUtilsRef.current?.pickHighlighted();
        break;
      case 'ArrowDown':
        optionsUtilsRef.current?.highlightNext();
        break;
      case 'ArrowUp':
        optionsUtilsRef.current?.highlightPrevious();
        break;
      case 'Escape':
        event.currentTarget.blur();
        break;
    }
  };

  const validateSelection = (values: Value[]) => {
    if (values.length === 0) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  return {
    onSelectValue,
    currentValues,
    optionsUtilsRef,
    inputRef,
    popoverRef,
    listRef,
    inputProps: {
      ...props,
      disabled,
      onFocus,
      onClick,
      onBlur,
      onKeyDown,
      invalid: isInvalid,
      pattern: getNotFoundExclusionPattern(notFoundLabel),
      defaultValue: defaultInputValue,
      'data-tooltip': inputRef.current?.title === '' ? null : inputRef.current?.title,
    },
  };
};
