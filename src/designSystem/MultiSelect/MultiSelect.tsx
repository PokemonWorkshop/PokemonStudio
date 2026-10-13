import DownIcon from '@assets/icons/global/down-icon.svg';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelectContainer, MultiSelectError, MultiSelectField, MultiSelectTextArea } from './MultiSelectContainer';
import { RenderOptions } from './RenderOptions';
import { MultiSelectProps, useMultiSelect } from './useMultiSelect';
import { ValueType } from './useRenderOptions';

export const MultiSelect = <Value extends ValueType, ChooseValue extends Value>(props: MultiSelectProps<Value, ChooseValue>) => {
  const { currentValues, onSelectValue, optionsUtilsRef, popoverRef, inputRef, listRef, inputProps, isInvalid, validationErrorMessage } =
    useMultiSelect({
      ...props,
      chooseValue: (props.chooseValue as Value[]) ?? [],
    });

  const { name, ...textAreaProps } = inputProps;
  const errorId = useId();
  const { t } = useTranslation();
  const showError = !!props.validationRef && isInvalid;

  const select = (
    <MultiSelectContainer className={`${props.className ?? ''} ${inputProps.invalid ? 'invalid' : ''}`.trim()}>
      <MultiSelectTextArea readOnly ref={inputRef} {...textAreaProps} />
      {name && currentValues.map((val, i) => <input key={i} type="hidden" name={`${name}.${i}`} value={val.toString()} />)}
      <DownIcon id="downArrow" />
      <RenderOptions currentValues={currentValues} onSelectValue={onSelectValue} utils={optionsUtilsRef} popover={popoverRef} listRef={listRef} />
    </MultiSelectContainer>
  );

  if (!props.validationRef) return select;

  return (
    <MultiSelectField>
      {select}
      {showError && (
        <MultiSelectError id={errorId} role="alert">
          {validationErrorMessage ?? t('multiselect_selection_required')}
        </MultiSelectError>
      )}
    </MultiSelectField>
  );
};
