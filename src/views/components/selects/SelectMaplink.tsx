import React, { useMemo } from 'react';
import { SelectOption, SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { SelectCustom, SelectCustomWithLabel } from '@components/SelectCustom';
import { useGetEntityNameText } from '@utils/ReadingProjectText';

const getValue = (options: SelectOption[], id: string, t: TFunction<'database_maplinks'>) => {
  const option = options.find(({ value }) => value === id);
  return option || { value: '__undef__', label: t('map_deleted') };
};

type SelectRMXPMapProps = {
  mapId: string;
  onChange: SelectChangeEvent;
  label?: string;
  noneValue?: true;
  noneValueIsError?: true;
  overwriteNoneValue?: string;
  excludeMaps?: number[];
};

export const SelectMaplink = ({ mapId, onChange, label, noneValue, noneValueIsError, overwriteNoneValue, excludeMaps }: SelectRMXPMapProps) => {
  const { t } = useTranslation('database_maplinks');
  const [state] = useGlobalState();
  const getMapName = useGetEntityNameText();
  const allMaps = useMemo(() => Object.values(state.projectData.maps), [state.projectData.maps]);

  const getMaplinkOptions = () => {
    const validMaps = Object.values(state.projectData.zones)
      .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
      .flatMap((zone) => zone.maps);
    return allMaps
      .filter(({ id }) => !(excludeMaps || []).includes(id) && validMaps.includes(id))
      .map((map) => ({
        value: map.id.toString(),
        label: getMapName(map),
      }))
      .sort((a, b) => Number(a.value) - Number(b.value));
  };

  const options = useMemo(() => {
    const rmxpOptions = getMaplinkOptions();
    return noneValue ? [{ value: '__undef__', label: overwriteNoneValue || t('none') }, ...rmxpOptions] : rmxpOptions;
  }, [state, excludeMaps, noneValue, overwriteNoneValue, t]);

  return label ? (
    <SelectCustomWithLabel
      options={options}
      onChange={onChange}
      value={getValue(options, mapId, t)}
      error={!allMaps.find((map) => map.id.toString() === mapId) && (noneValueIsError ? true : mapId !== '__undef__')}
      noOptionsText={t('no_option')}
      label={label}
    />
  ) : (
    <SelectCustom
      options={options}
      onChange={onChange}
      value={getValue(options, mapId, t)}
      error={!allMaps.find((map) => map.id.toString() === mapId) && (noneValueIsError ? true : mapId !== '__undef__')}
      noOptionsText={t('no_option')}
    />
  );
};
