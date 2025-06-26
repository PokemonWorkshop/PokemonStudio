import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { Select } from '@ds/Select';
import { useZonePage } from '@src/hooks/usePage';
import { useUpdateZone } from './useUpdateZone';
import type { StudioZone, StudioZoneForcedWeather } from '@modelEntities/zone';
import { padStr } from '@utils/PadStr';
import { MultiSelect } from '@ds/MultiSelect';
import { useSelectOptions } from '@src/hooks/useSelectOptions';
import { ProjectData } from '@src/GlobalStateProvider';
import type { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectOption } from '@ds/Select/types';

// -1 = By default, 0 = None, 1 = Rain, 2 = Sun/Zenith, 3 = Sandstorm, 4 = Hail, 5 = Foggy
const WeatherCategories = [-1, 0, 1, 2, 3, 4, 5] as const;

const weatherCategoryEntries = (t: TFunction) =>
  WeatherCategories.map((category) => ({ value: category.toString(), label: t(`weather${category}`) }));

const mapDbSymbolsFromMapIds = (mapIds: number[]) => mapIds.map((mapId) => `map${padStr(mapId, 3)}` as DbSymbol);
const mapIdsFromMapDbSymbols = (mapDbSymbols: DbSymbol[], maps: ProjectData['maps']) => mapDbSymbols.map((dbSymbol) => maps[dbSymbol].id);

const filterMapsAlreadyAssignedInZones = (mapOptions: SelectOption<DbSymbol>[], zonesData: ProjectData['zones'], currentZone: StudioZone) => {
  const zones = Object.values(zonesData);
  const maps = new Set(
    zones.reduce<number[]>((maps, zone) => {
      if (zone.dbSymbol === currentZone.dbSymbol) return maps;

      maps.push(...zone.maps);
      return maps;
    }, [])
  );
  const mapDbSymbolsAssigned = mapDbSymbolsFromMapIds(Array.from(maps.values()));
  const mapDbSymbolsCurrentZone = mapDbSymbolsFromMapIds(currentZone.maps);
  return mapOptions.reduce((options, option) => {
    const index = mapDbSymbolsAssigned.findIndex((mapDbSymbol) => mapDbSymbol === option.value);
    if (index === -1 || mapDbSymbolsCurrentZone.includes(option.value)) return [...options, option];

    return options;
  }, [] as SelectOption<DbSymbol>[]);
};

export const ZoneSettingsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { zone, state } = useZonePage();
  const updateZone = useUpdateZone(zone);
  const forcedWeatherRef = useRef<string | undefined>();
  const panelIdRef = useRef<HTMLInputElement>(null);
  const weatherOptions = useMemo(() => weatherCategoryEntries(t), [t]);
  const [maps, setMaps] = useState<DbSymbol[]>(mapDbSymbolsFromMapIds(zone.maps));
  const defaultMapOptions = useSelectOptions('maps') as SelectOption<DbSymbol>[];
  const mapOptions = useMemo(() => filterMapsAlreadyAssignedInZones(defaultMapOptions, state.projectData.zones, zone), []);

  const canClose = () => {
    const result = !!panelIdRef?.current?.validity.valid;

    return result;
  };

  const onClose = () => {
    if (!forcedWeatherRef?.current || !panelIdRef?.current || !canClose()) return;

    const forcedWeather = forcedWeatherRef.current === '-1' ? null : (parseInt(forcedWeatherRef.current) as StudioZoneForcedWeather);

    updateZone({
      forcedWeather,
      panelId: panelIdRef.current.valueAsNumber,
      maps: mapIdsFromMapDbSymbols(maps, state.projectData.maps),
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('settings')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="map">{t('maps_list')}</Label>
          <MultiSelect defaultValue={maps} onChange={setMaps} options={mapOptions} />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="panel-number">{t('panel_number')}</Label>
          <Input type="number" name="panel-number" min="0" max="99999" defaultValue={zone.panelId} ref={panelIdRef} />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-weather">{t('forced_weather')}</Label>
          <Select
            id="select-weather"
            options={weatherOptions}
            optionRef={forcedWeatherRef}
            defaultValue={zone.forcedWeather === null ? '-1' : zone.forcedWeather.toString()}
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ZoneSettingsEditor.displayName = 'ZoneSettingsEditor';
