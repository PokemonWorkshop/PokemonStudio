import {
  ChangeEventHandler,
  FocusEventHandler,
  InputHTMLAttributes,
  KeyboardEventHandler,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RenderOptionRef, SelectOption } from './types';
import { getNotFoundExclusionPattern, getSelectDefaultLabel, positionAndShowPopover } from './utils';
import type { List } from 'react-virtualized/dist/es/List';

export type SelectProps<Value extends string, ChooseValue extends string> = {
  options: Readonly<SelectOption<Value>[]>;
  chooseValue?: ChooseValue;
  className?: string;
  notFoundLabel?: string;
  value?: Value | ChooseValue;
  defaultValue?: Value;
  optionRef?: React.MutableRefObject<Value | ChooseValue | undefined>;
  onChange?: (value: Value) => void;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'min' | 'max' | 'value' | 'onChange' | 'type' | 'multiple' | 'list' | 'checked'>;

export const useSelect = <Value extends string, ChooseValue extends string>({
  options,
  chooseValue,
  className,
  notFoundLabel,
  value,
  defaultValue,
  optionRef,
  onChange,
  disabled: disabledFromOutside,
  name,
  ...props
}: SelectProps<Value, ChooseValue>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);
  const optionsUtilsRef = useRef<RenderOptionRef<Value, ChooseValue>>(null);
  const [currentValue, setCurrentValue] = useState(value ?? defaultValue ?? chooseValue);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const defaultInputValue = useMemo(() => getSelectDefaultLabel(value, defaultValue, options, currentValue, notFoundLabel), [value]);
  const disabled = disabledFromOutside || options.length === 0;

  useImperativeHandle(optionRef, () => currentValue, [currentValue]);
  useEffect(() => {
    if (outputRef.current && typeof currentValue === 'string') outputRef.current.value = currentValue;
  }, [currentValue]);

  // Reset input value whenever defaultInputValue changes because defaultValue is definitive so value change can't be forwarded through defaultValue
  useEffect(() => {
    // If defaultInputValue did change, then current value must change
    if (value != currentValue && !defaultValue) {
      const newValue = value ?? chooseValue;
      setCurrentValue(newValue);
      if (inputRef.current) inputRef.current.value = getSelectDefaultLabel(value, defaultValue, options, newValue, notFoundLabel);
    }
  }, [value]);

  // Select value again when options changes and main input visually change
  useEffect(() => {
    const newInputLabel = getSelectDefaultLabel(currentValue, defaultValue, options, currentValue, notFoundLabel);
    const currentInputLabel = inputRef.current?.value;
    if (newInputLabel !== currentInputLabel) {
      if (inputRef.current) inputRef.current.value = newInputLabel;
      if (currentValue !== chooseValue) onChange?.(currentValue as Value);
    }
  }, [options]);

  // Apply selected value
  const onSelectValue = (value: Value) => {
    optionsUtilsRef.current?.hide();
    setCurrentValue(value);
    onChange?.(value);

    // Timeout let react re-render
    setTimeout(() => {
      if (inputRef.current) inputRef.current.blur();
    }, 25);
  };

  // Let the popover know what to show when the input gets focus
  const onFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    if (disabled || !popoverRef.current) return;

    optionsUtilsRef.current?.show(currentValue, options);
    positionAndShowPopover(event.currentTarget, popoverRef.current);
  };

  // Hide the popover when it loses focus and revert text value to appropriate one
  const onBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (disabled || !popoverRef.current) return;

    optionsUtilsRef.current?.hide();
    popoverRef.current.classList.remove('visible');
    event.currentTarget.value =
      options.find((o) => o.value === currentValue)?.label || getSelectDefaultLabel(value, defaultValue, options, currentValue, notFoundLabel);
  };

  // Handle navigation in select elements
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
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

  // Handle search when user inputs stuff in the input, we let the select unfiltered by default so user knows there's more options than the current one!
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (disabled) return;

    const value = event.currentTarget.value.toLowerCase();
    const newOptions = options.filter((o) => o.value.toLowerCase().includes(value) || o.label.toLowerCase().includes(value));
    optionsUtilsRef.current?.refine(newOptions);
  };

  return {
    onSelectValue,
    optionsUtilsRef,
    inputRef,
    outputRef,
    popoverRef,
    listRef,
    inputProps: {
      ...props,
      disabled,
      onFocus,
      onBlur,
      onKeyDown,
      onChange: onInputChange,
      pattern: getNotFoundExclusionPattern(notFoundLabel),
      defaultValue: defaultInputValue,
    },
    outputProps: {
      name,
      'data-input-type': 'data-input-type' in props ? props['data-input-type'] : undefined,
    },
  };
};
