import React, { useEffect, useState } from 'react';
import { MapLinkCardWithClearButtonContainer, MapLinkTitleContainer } from './MapLinkCardStyle';
import { Cardinal, MapLinkLink } from '@modelEntities/maplinks/MapLink.model';
import { useTranslation } from 'react-i18next';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { InputOffset } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type MapLinkCardProps = {
  mapLinkLink: MapLinkLink;
  index: number;
  cardinal: Cardinal;
  mapData: Map<number, string>;
  onDeleteLink: (index: number, cardinal: Cardinal) => void;
  onEditOffset: (index: number, cardinal: Cardinal, offset: number) => void;
  onEditLink: (index: number, cardinal: Cardinal) => void;
};

export const MapLinkCard = ({ mapLinkLink, index, cardinal, mapData, onDeleteLink, onEditOffset, onEditLink }: MapLinkCardProps) => {
  const mapName = mapData.get(mapLinkLink.mapId);
  const [offset, setOffset] = useState<number>(mapLinkLink.offset);
  const { t } = useTranslation('database_maplinks');

  useEffect(() => {
    setOffset(mapLinkLink.offset);
  }, [mapLinkLink.offset]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      target.blur();
    }
  };

  const onClickDelete = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onDeleteLink(index, cardinal);
  };

  return (
    <MapLinkCardWithClearButtonContainer data-type="link" onClick={() => onEditLink(index, cardinal)}>
      <MapLinkTitleContainer data-type="link">
        {mapName ? <span className="map-name">{mapName}</span> : <span className="map-name-error">{t('map_deleted')}</span>}
        <span className="map-id">#{mapLinkLink.mapId}</span>
      </MapLinkTitleContainer>
      <InputOffset
        type="number"
        name="offset"
        min="-99999"
        max="99999"
        value={isNaN(offset) ? '' : offset}
        onChange={(event) => {
          const newValue = parseInt(event.target.value);
          if (newValue < -99999 || newValue > 99999) return event.preventDefault();
          setOffset(newValue);
        }}
        onBlur={() => {
          setOffset(cleanNaNValue(offset));
          onEditOffset(index, cardinal, offset);
        }}
        onKeyDown={handleKeyDown}
        cardinal={cardinal}
      />
      <button className="clear-button">
        <ClearButtonOnlyIcon onClick={onClickDelete} />
      </button>
    </MapLinkCardWithClearButtonContainer>
  );
};
