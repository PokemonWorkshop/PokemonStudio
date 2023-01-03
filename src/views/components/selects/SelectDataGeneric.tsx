import React, { useMemo } from 'react';
import { SelectOption, SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom, SelectCustomWithLabel, SelectCustomWithLabelResponsive } from '@components/SelectCustom';
import { ProjectData } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { DbSymbol } from '@modelEntities/dbSymbol';

type Entity = { dbSymbol: DbSymbol };
type SelectDataGenericProps = {
  data: Entity | SelectOption;
  options: SelectOption[];
  noOptionsText: string;
  onChange: SelectChangeEvent;
  label?: string;
  error?: boolean;
  rejected?: string[];
  breakpoint?: string;
  noneValue?: true;
  overwriteNoneValue?: string;
};

export const getSelectDataOptionsOrderedById = <K extends keyof ProjectData>(
  projectData: ProjectData,
  key: K,
  getText: (entity: typeof projectData[K][string]) => string
): SelectOption[] =>
  Object.values(projectData[key])
    .sort((a, b) => a.id - b.id)
    .map((data) => ({ value: data.dbSymbol, label: getText(data) }));

export const getSelectDataOptionsOrderedByLabel = <K extends keyof ProjectData>(
  projectData: ProjectData,
  key: K,
  getText: (entity: typeof projectData[K][string]) => string
): SelectOption[] =>
  Object.values(projectData[key])
    .map((data) => ({ value: data.dbSymbol, label: getText(data) }))
    .sort((a, b) => a.label.localeCompare(b.label));

const getValue = (data: Entity | SelectOption, t: TFunction<'select'>, options: SelectOption[], overwriteNoneValue?: string) => {
  if ('value' in data && data.value === '__undef__') return { value: data.value, label: overwriteNoneValue || t('none') };
  if ('value' in data) return data;
  return options.find(({ value }) => value === data.dbSymbol) || { value: data.dbSymbol, label: overwriteNoneValue || t('none') };
};

const getOptions = (selectOptions: SelectOption[], t: TFunction<'select'>, rejected?: string[], noneValue?: true, overwriteNoneValue?: string) => {
  const options = rejected ? selectOptions.filter((so) => !rejected.includes(so.value)) : selectOptions.slice();
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
        value={getValue(data, t, options, overwriteNoneValue)}
        options={genericOptions}
        noOptionsText={noOptionsText}
        onChange={onChange}
        label={label}
        error={error}
        breakpoint={breakpoint}
      />
    ) : (
      <SelectCustomWithLabel
        value={getValue(data, t, options, overwriteNoneValue)}
        options={genericOptions}
        noOptionsText={noOptionsText}
        onChange={onChange}
        label={label}
        error={error}
      />
    )
  ) : (
    <SelectCustom
      value={getValue(data, t, options, overwriteNoneValue)}
      options={genericOptions}
      noOptionsText={noOptionsText}
      onChange={onChange}
      error={error}
    />
  );
};
