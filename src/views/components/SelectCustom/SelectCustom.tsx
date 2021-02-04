import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption, SelectCustomProps } from './SelectCustomPropsInterface';
import { SelectElementStyle, SelectCustomStyle } from './SelectCustomStyle';

export const SelectCustom: FunctionComponent<SelectCustomProps> = (
  props: SelectCustomProps
) => {
  const { label, options, noOptionsText, defaultValue, onChange } = props;
  const { t } = useTranslation('select');

  return (
    <SelectCustomStyle>
      <span id="label">{label}</span>
      <SelectElementStyle
        classNamePrefix="react-select"
        options={options}
        onChange={(data) => onChange(data as SelectOption)}
        defaultValue={defaultValue || options[0]}
        noOptionsMessage={(input) =>
          noOptionsText
            ? `${noOptionsText} «\u00a0${input.inputValue}\u00a0»`
            : `${t('no_option')} «\u00a0${input.inputValue}\u00a0»`
        }
      />
    </SelectCustomStyle>
  );
};
