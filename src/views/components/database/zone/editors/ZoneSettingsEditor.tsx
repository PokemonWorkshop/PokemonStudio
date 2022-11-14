import React, { useMemo, useRef, useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import ZoneModel, { WeatherCategories } from '@modelEntities/zone/Zone.model';
import styled from 'styled-components';
import { TagWithDeletion, TagWithDeletionContainer } from '@components/Tag';
import { padStr } from '@utils/PadStr';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { SelectCustomSimple } from '@components/SelectCustom';
import { TextInputError } from '@components/inputs/Input';

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

const weatherCategoryEntries = (t: TFunction<'database_zones'>) =>
  WeatherCategories.map((category) => ({ value: category.toString(), label: t(`weather${category}`) }));

type ZoneSettingsEditorProps = {
  zone: ZoneModel;
};

export const ZoneSettingsEditor = ({ zone }: ZoneSettingsEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorNewMap, setErrorNewMap] = useState<number | false>(false);
  const { t } = useTranslation('database_zones');
  const weatherOptions = useMemo(() => weatherCategoryEntries(t), [t]);
  const refreshUI = useRefreshUI();

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (inputRef.current && inputRef.current.validity.valid && event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const mapIds = target.value
        .split(',')
        .filter((v) => v.trim().length !== 0)
        .map((v) => Number(v))
        .filter((v, i, a) => i === a.indexOf(v));
      const errorMapId = mapIds.find((mapId) => zone.maps.includes(mapId));
      if (errorMapId) {
        setErrorNewMap(errorMapId);
        return;
      }

      inputRef.current.value = '';
      if (errorNewMap) setErrorNewMap(false);
      refreshUI((zone.maps = zone.maps.concat(mapIds)));
    }
  };

  const onDeleteMap = (index: number) => {
    refreshUI(zone.maps.splice(index, 1));
  };

  const onChangeForcedWeather = (value: number) => {
    refreshUI((zone.forcedWeather = value === -1 ? null : value));
  };

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
            {zone.maps
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
          <Input
            type="number"
            name="panel-number"
            min="0"
            max="99999"
            value={isNaN(zone.panelId) ? '' : zone.panelId}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              if (value < 0 || value > 99_999) return event.preventDefault();
              refreshUI((zone.panelId = value));
            }}
            onBlur={() => refreshUI((zone.panelId = cleanNaNValue(zone.panelId)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="weather">{t('forced_weather')}</Label>
          <SelectCustomSimple
            id="select-weather"
            options={weatherOptions}
            onChange={(value) => onChangeForcedWeather(Number(value))}
            value={String(zone.forcedWeather === null ? -1 : zone.forcedWeather)}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
