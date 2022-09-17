import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectCustom, SelectCustomWithLabel } from '@components/SelectCustom';

const getRMXPMapOptions = (state: State, excludeMaps: number[]): SelectOption[] =>
  Object.entries(state.rmxpMaps)
    .filter(([, rmxpMap]) => !excludeMaps.includes(rmxpMap.id))
    .map(([, rmxpMap]) => ({
      value: rmxpMap.id.toString(),
      label: rmxpMap.name,
    }));

const getValue = (options: SelectOption[], id: string, t: TFunction<'database_maplinks'>): SelectOption => {
  const option = options.find(({ value }) => value === id);
  return option || { value: '__undef__', label: t('map_deleted') };
};

type SelectRMXPMapProps = {
  mapId: string;
  onChange: (selected: SelectOption) => void;
  label?: string;
  noneValue?: true;
  noneValueIsError?: true;
  overwriteNoneValue?: string;
  excludeMaps?: number[];
};

export const SelectRMXPMap = ({ mapId, onChange, label, noneValue, noneValueIsError, overwriteNoneValue, excludeMaps }: SelectRMXPMapProps) => {
  const { t } = useTranslation('database_maplinks');
  const [state] = useGlobalState();
  const options = useMemo(() => {
    const rmxpMAPOptions = getRMXPMapOptions(state, excludeMaps || []).sort((a, b) => Number(a.value) - Number(b.value));
    return noneValue ? [{ value: '__undef__', label: overwriteNoneValue || t('none') }, ...rmxpMAPOptions] : rmxpMAPOptions;
  }, [state, noneValue, overwriteNoneValue]);

  return label ? (
    <SelectCustomWithLabel
      options={options}
      onChange={onChange}
      value={getValue(options, mapId, t)}
      error={!state.rmxpMaps.find((rmxpMap) => rmxpMap.id.toString() === mapId) && (noneValueIsError ? true : mapId !== '__undef__')}
      noOptionsText={t('no_option')}
      label={label}
    />
  ) : (
    <SelectCustom
      options={options}
      onChange={onChange}
      value={getValue(options, mapId, t)}
      error={!state.rmxpMaps.find((rmxpMap) => rmxpMap.id.toString() === mapId) && (noneValueIsError ? true : mapId !== '__undef__')}
      noOptionsText={t('no_option')}
    />
  );
};
