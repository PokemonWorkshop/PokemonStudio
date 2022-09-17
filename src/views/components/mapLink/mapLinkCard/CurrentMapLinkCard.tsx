import React from 'react';
import { MapLinkCardContainer, MapLinkTitleContainer } from './MapLinkCardStyle';
import MapLinkModel from '@modelEntities/maplinks/MapLink.model';
import { useTranslation } from 'react-i18next';

type CurrentMapLinkCardProps = {
  mapLink: MapLinkModel;
  mapData: Map<number, string>;
};

export const CurrentMapLinkCard = ({ mapLink, mapData }: CurrentMapLinkCardProps) => {
  const mapName = mapData.get(mapLink.mapId);
  const { t } = useTranslation('database_maplinks');

  return (
    <MapLinkCardContainer data-type="current">
      <MapLinkTitleContainer data-type="current">
        {mapName ? <span className="map-name">{mapName}</span> : <span className="map-name-error">{t('map_deleted')}</span>}
        <span className="map-id">#{mapLink.mapId}</span>
      </MapLinkTitleContainer>
    </MapLinkCardContainer>
  );
};
