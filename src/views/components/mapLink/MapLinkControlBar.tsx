import React from 'react';
import styled from 'styled-components';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectMaplink } from '@components/selects';
import { useTranslation } from 'react-i18next';

const MapLinkControlBarContainer = styled(ControlBar)`
  display: flex;
  justify-content: center;
`;

type MapLinkControlBarProps = {
  onChange: SelectChangeEvent;
  mapId: string;
};

export const MapLinkControlBar = ({ onChange, mapId }: MapLinkControlBarProps) => {
  const { t } = useTranslation('database_maplinks');
  return (
    <MapLinkControlBarContainer>
      <SelectMaplink mapId={mapId} onChange={onChange} label={t('map')} />
    </MapLinkControlBarContainer>
  );
};
