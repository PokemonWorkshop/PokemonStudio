import React from 'react';
import { DataBlockWithTitle, DataGrid } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { DataFieldsetField, DataFieldsetFieldCode, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import styled from 'styled-components';
import { Code } from '@components/Code';
import { padStr } from '@utils/PadStr';
import { StudioZone } from '@modelEntities/zone';
import { ZoneDialogsRef } from './editors/ZoneEditorOverlay';

const MapsListContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

type ZoneSettingsProps = {
  zone: StudioZone;
  dialogsRef: ZoneDialogsRef;
};

export const ZoneSettings = ({ zone, dialogsRef }: ZoneSettingsProps) => {
  const { t } = useTranslation();

  return (
    <DataBlockWithTitle size="half" title={t('settings')} onClick={() => dialogsRef.current?.openDialog('settings')}>
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
          data={zone.forcedWeather === null ? t('weather-1') : t(`weather${zone.forcedWeather}`)}
          disabled={zone.forcedWeather === null}
        />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
