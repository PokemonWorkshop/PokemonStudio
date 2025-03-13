import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import styled from 'styled-components';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TextInputError } from '@components/inputs/Input';
import { TagWithDeletion, TagWithDeletionContainer } from '@components/Tag';
import { Select } from '@ds/Select';

import { useZonePage } from '@src/hooks/usePage';
import { useUpdateZone } from './useUpdateZone';

import { StudioZoneForcedWeather } from '@modelEntities/zone';

import { padStr } from '@utils/PadStr';
import { cloneEntity } from '@utils/cloneEntity';

const InputMapsListContainer = styled(InputWithTopLabelContainer)`
  gap: 16px;
`;

const InputMapWithErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${Input} {
    text-align: left;
  }
`;

const MapsListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 4px;

  ${TagWithDeletionContainer} {
    gap: 4px;

    span.map-id {
      height: 18px;
    }
  }
`;

// -1 = By default, 0 = None, 1 = Rain, 2 = Sun/Zenith, 3 = Sandstorm, 4 = Hail, 5 = Foggy
const WeatherCategories = [-1, 0, 1, 2, 3, 4, 5] as const;

const weatherCategoryEntries = (t: TFunction<'database_zones'>) =>
  WeatherCategories.map((category) => ({ value: category.toString(), label: t(`weather${category}`) }));

export const ZoneSettingsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_zones');
  const { zone } = useZonePage();
  const updateZone = useUpdateZone(zone);
  const forcedWeatherRef = useRef<string | undefined>();
  const panelIdRef = useRef<HTMLInputElement>(null);
  const weatherOptions = useMemo(() => weatherCategoryEntries(t), [t]);
  const [maps, setMaps] = useState<number[]>(cloneEntity(zone.maps));
  const [errorNewMap, setErrorNewMap] = useState<number | false>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (inputRef.current && inputRef.current.validity.valid && event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const mapIds = target.value
        .split(',')
        .filter((v) => v.trim().length !== 0)
        .map((v) => Number(v))
        .filter((v, i, a) => i === a.indexOf(v));
      const errorMapId = mapIds.find((mapId) => maps.includes(mapId));
      if (errorMapId !== undefined) {
        setErrorNewMap(errorMapId);
        return;
      }

      inputRef.current.value = '';
      if (errorNewMap !== false) setErrorNewMap(false);
      setMaps(maps.concat(mapIds));
    }
  };

  const onDeleteMap = (index: number) => {
    setMaps(cloneEntity(maps).splice(index, 1));
  };

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
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('settings')}>
      <InputContainer>
        <InputMapsListContainer>
          <Label htmlFor="map">{t('maps_list')}</Label>
          <InputMapWithErrorContainer>
            <Input type="text" name="map" pattern="[0-9]{1,5} *(?:, *[0-9]{0,5} *)*" ref={inputRef} onKeyDown={handleKeyDown} />
            {errorNewMap !== false && <TextInputError>{t('map_already_exists', { mapId: padStr(errorNewMap, 2) })}</TextInputError>}
          </InputMapWithErrorContainer>
          <MapsListContainer>
            {maps
              .sort((a, b) => a - b)
              .map((id, index) => (
                <TagWithDeletion key={index} index={index} onClickDelete={onDeleteMap}>
                  <span className="map-id">{padStr(id, 2)}</span>
                </TagWithDeletion>
              ))}
          </MapsListContainer>
        </InputMapsListContainer>
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
