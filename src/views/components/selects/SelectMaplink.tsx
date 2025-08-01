import React, { useMemo } from 'react';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { SelectCustom, SelectCustomWithLabel } from '@components/SelectCustom';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMapLinks, useProjectMaps, useProjectZones } from '@src/hooks/useProjectData';
import { getValidMaps } from '@utils/MapLinkUtils';
import { SelectOption } from '@ds/Select/types';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { StudioDropDown } from '@components/StudioDropDown';

const getValue = (options: SelectOption<string>[], id: string, t: TFunction) => {
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
  const { t } = useTranslation();
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

type SelectMapLink2Props = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectMapLink2 = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectMapLink2Props) => {
  const { projectDataValues: mapLinks } = useProjectMapLinks();
  const { projectDataValues: maps } = useProjectMaps();
  const { projectDataValues: zones } = useProjectZones();
  const allMapLinks = useMemo(() => Object.values(mapLinks), [mapLinks]);
  const allMaps = useMemo(() => Object.values(maps), [maps]);
  const getMapName = useGetEntityNameText();
  const { t } = useTranslation();

  const getMapFromMapId = (mapId: number) => allMaps.find(({ id }) => id === mapId);

  const mapLinkOptions = useMemo(() => {
    const validMaps = getValidMaps(zones);
    return allMapLinks.map(({ dbSymbol, mapId }) => {
      const map = getMapFromMapId(mapId);
      const mapName = map && validMaps.includes(map.id) ? getMapName(map) : t('map_deleted');
      return { value: dbSymbol, label: mapName };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMapLinks, zones]);

  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...mapLinkOptions];
    return mapLinkOptions;
  }, [mapLinkOptions, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('maplink_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('maplinks')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
