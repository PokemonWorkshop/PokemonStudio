import React from 'react';
import { DataBlockWithTitle, DataGrid } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { DataFieldsetField, DataFieldsetFieldCode, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import styled from 'styled-components';
import { Code } from '@components/Code';
import { padStr } from '@utils/PadStr';
import { StudioZone } from '@modelEntities/zone';

const MapsListContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

type ZoneSettingsProps = {
  zone: StudioZone;
  onClick: () => void;
};

export const ZoneSettings = ({ zone, onClick }: ZoneSettingsProps) => {
  const { t } = useTranslation('database_zones');

  return (
    <DataBlockWithTitle size="half" title={t('settings')} onClick={onClick}>
      <DataGrid columns="1fr" rows="1fr 53px 42px">
        {zone.maps.length === 0 ? (
          <DataFieldsetField label={t('maps_list')} data={t('no_map')} disabled={true} />
        ) : (
          <DataFieldsetFieldWithChild label={t('maps_list')} size="m">
            <MapsListContainer>
              {zone.maps
                .sort((a, b) => a - b)
                .map((id, index) => (
                  <Code key={index}>{`#${padStr(id, 2)}`}</Code>
                ))}
            </MapsListContainer>
          </DataFieldsetFieldWithChild>
        )}
        <DataFieldsetFieldCode label={t('displayed_panel')} data={`#${padStr(zone.panelId, 2)}`} size="m" />
        <DataFieldsetField
          label={t('forced_weather')}
          data={zone.forcedWeather === null ? t('weather-1') : t(`weather${zone.forcedWeather}` as never)}
          disabled={zone.forcedWeather === null}
        />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
