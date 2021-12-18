import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import PSDKEntity from '@modelEntities/PSDKEntity';
import { SelectCustom, SelectCustomWithLabel, SelectCustomWithLabelResponsive } from '@components/SelectCustom';
import { ProjectData } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';

type SelectDataGenericProps = {
  data: PSDKEntity | SelectOption;
  options: SelectOption[];
  noOptionsText: string;
  onChange: (selected: SelectOption) => void;
  label?: string;
  error?: boolean;
  rejected?: string[];
  breakpoint?: string;
  noneValue?: true;
  overwriteNoneValue?: string;
};

export const getDataOptions = (projectData: ProjectData, key: keyof ProjectData, alphabeticalOrder?: boolean): SelectOption[] =>
  Object.entries(projectData[key])
    .map(([value, data]) => ({ value, label: data.name(), index: data.id }))
    .sort((a, b) => (alphabeticalOrder ? a.label.localeCompare(b.label) : a.index - b.index));

const getValue = (data: PSDKEntity | SelectOption, t: TFunction<'select'>, overwriteNoneValue?: string) => {
  if ('value' in data && data.value === '__undef__') return { value: data.value, label: overwriteNoneValue || t('none') };
  if ('value' in data) return data;
  return { value: data.dbSymbol, label: data.name() };
};

const getOptions = (selectOptions: SelectOption[], t: TFunction<'select'>, rejected?: string[], noneValue?: true, overwriteNoneValue?: string) => {
  const options = rejected ? selectOptions.filter((so) => !rejected.includes(so.value)) : selectOptions;
  if (noneValue && (options.length === 0 || options[0].value !== '__undef__')) {
    options.unshift({ value: '__undef__', label: overwriteNoneValue || t('none') });
  }
  return options;
};

export const SelectDataGeneric = ({
  data,
  options,
  noOptionsText,
  onChange,
  label,
  error,
  rejected,
  breakpoint,
  noneValue,
  overwriteNoneValue,
}: SelectDataGenericProps) => {
  const { t } = useTranslation('select');
  const genericOptions = useMemo(
    () => getOptions(options, t, rejected, noneValue, overwriteNoneValue),
    [noneValue, options, rejected, overwriteNoneValue, t]
  );

  if (breakpoint && !label) console.warn('Breakpoint is useless if no label');

  return label ? (
    breakpoint ? (
      <SelectCustomWithLabelResponsive
        value={getValue(data, t, overwriteNoneValue)}
        options={genericOptions}
        noOptionsText={noOptionsText}
        onChange={onChange}
        label={label}
        error={error}
        breakpoint={breakpoint}
      />
    ) : (
      <SelectCustomWithLabel
        value={getValue(data, t, overwriteNoneValue)}
        options={genericOptions}
        noOptionsText={noOptionsText}
        onChange={onChange}
        label={label}
        error={error}
      />
    )
  ) : (
    <SelectCustom
      value={getValue(data, t, overwriteNoneValue)}
      options={genericOptions}
      noOptionsText={noOptionsText}
      onChange={onChange}
      error={error}
    />
  );
};
