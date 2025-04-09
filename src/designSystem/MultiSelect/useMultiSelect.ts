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
import { RenderOptionRef, MultiSelectOption } from './types';
import { findOptionIndices, getNotFoundExclusionPattern, getSelectDefaultLabel, positionAndShowPopover } from './utils';
import type { List } from 'react-virtualized/dist/es/List';
import { normalize } from '@utils/normalize';
import { ValueType } from './useRenderOptions';
import { useTranslation } from 'react-i18next';

export type MultiSelectProps<Value extends ValueType, ChooseValue extends Value> = {
  options: Readonly<MultiSelectOption<Value>[]>;
  chooseValue?: ChooseValue[];
  className?: string;
  notFoundLabel?: string;
  value?: Value[] | ChooseValue[];
  defaultValue?: Value[];
  optionRef?: React.MutableRefObject<Value[] | ChooseValue[]>;
  onChange?: (value: Value[]) => void;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'min' | 'max' | 'value' | 'onChange' | 'type' | 'multiple' | 'list' | 'checked'>;

export const useMultiSelect = <Value extends ValueType, ChooseValue extends Value>({
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
}: MultiSelectProps<Value, ChooseValue>) => {
  const { t } = useTranslation('select');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);
  const optionsUtilsRef = useRef<RenderOptionRef<Value, ChooseValue>>(null);
  const [currentValues, setCurrentValues] = useState(value ?? defaultValue ?? chooseValue ?? []);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const defaultInputValue = useMemo(() => getSelectDefaultLabel(currentValues, defaultValue, options, t), [value]);
  const disabled = disabledFromOutside || options.length === 0;

  useImperativeHandle(optionRef, () => currentValues, [currentValues]);
    useEffect(() => {
      if (outputRef.current && Array.isArray(currentValues)) {
        if(inputRef.current) inputRef.current.value = getSelectDefaultLabel(currentValues, defaultValue, options, t);
        outputRef.current.value = currentValues.map((value) => value.toString()).join(',');
      }
    }, [currentValues, defaultValue, value]);
    
  // Reset input value whenever defaultInputValue changes because defaultValue is definitive so value change can't be forwarded through defaultValue
  useEffect(() => {
    // If defaultInputValue did change, then current value must change
    if (value != currentValues && !defaultValue) {
      const newValue = value ?? chooseValue ?? [];
      setCurrentValues(newValue);
      onChange?.(newValue);
      if (inputRef.current) inputRef.current.value = getSelectDefaultLabel(newValue, defaultValue, options, t);
    }
  }, [value]);

    // Select value again when options changes and main input visually change
    useEffect(() => {
      const newInputLabel = getSelectDefaultLabel(currentValues, defaultValue, options, t);
      const currentInputLabel = inputRef.current?.value;
      if (newInputLabel !== currentInputLabel) {
        if (inputRef.current) inputRef.current.value = newInputLabel;
        if (currentValues !== chooseValue) onChange?.(currentValues);
      }
    }, [options]);


  // Apply selected value
const onSelectValue = (value: Value) => {
  const newValues = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value];

  setCurrentValues(newValues);

  onChange?.(newValues);

  if (inputRef.current) {
    const optionIndex = findOptionIndices(options, newValues);
    const shouldShowTooltip = newValues.length > 3;
    inputRef.current.title = shouldShowTooltip ? optionIndex.map((index) => options[index]?.label).join(', ') || '' : '';
    inputRef.current.value = getSelectDefaultLabel(newValues, defaultValue, options, t);
  }
};

  // Let the popover know what to show when the input gets focus
  const onFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    if (disabled || !popoverRef.current) return;

    optionsUtilsRef.current?.show(Array.isArray(currentValues) ? currentValues : [currentValues], options);
    positionAndShowPopover(event.currentTarget, popoverRef.current);
  };

  // Hide the popover when it loses focus and revert text value to appropriate one
  const onBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (disabled || !popoverRef.current) return;

    optionsUtilsRef.current?.hide();
    popoverRef.current.classList.remove('visible');
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

    const value = normalize(event.currentTarget.value);
    const newOptions = options.filter((o) => normalize(o.value).includes(value) || normalize(o.label).includes(value));
    optionsUtilsRef.current?.refine(newOptions);
  };

  return {
    onSelectValue,
    currentValues,
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
      'data-tooltip': inputRef.current?.title,
    },
    outputProps: {
      name,
      'data-input-type': 'data-input-type' in props ? props['data-input-type'] : undefined,
    },
  };
};
