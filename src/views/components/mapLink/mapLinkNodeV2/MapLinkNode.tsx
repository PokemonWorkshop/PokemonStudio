import { ResourceImage } from '@components/ResourceImage';
import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateMapLink } from '../editors';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { useKeyPress, useStore } from '@xyflow/react';
import { getMapSizeStyle } from '@utils/MapLinkUtils';
import { useTranslation } from 'react-i18next';
import { useGetEntityNameText } from '@src/utils/ReadingProjectText';
import { CONTROL } from '@hooks/useKeyPress';
import { useNavigateMapLink } from '@hooks/useNavigateMapLink';
import React from 'react';
import styled from 'styled-components';

type MapLinkNodeContainer = {
  dragging?: boolean;
  zoom: number;
};

type MapLinkNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
    cardinal: StudioMapLinkCardinal;
    index: number;
    tileSize: number;
  };
  dragging?: boolean;
};

const MapLinkNodeContainer = styled.div<MapLinkNodeContainer>`
  position: relative;
  display: inline-block;
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;

  & img {
    display: block;
  }

  & .clear-button {
    display: none;
  }

  & .map-deleted {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    ${({ theme }) => theme.fonts.titlesHeadline4};
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & .map-name {
    display: none;
  }

  &:hover {
    & .clear-button {
      position: absolute;
      display: ${({ dragging }) => (dragging ? 'none' : 'flex')};
      top: ${({ zoom }) => 4 / zoom}px;
      right: ${({ zoom }) => 4 / zoom}px;
      height: 40px;
      width: 40px;
      scale: ${({ zoom }) => 1 / zoom};
      transform-origin: top right;
    }

    & .map-name {
      position: absolute;
      display: ${({ dragging }) => (dragging ? 'none' : 'block')};
      box-sizing: border-box;
      top: ${({ zoom }) => 4 / zoom}px;
      left: ${({ zoom }) => 4 / zoom}px;
      max-width: 64%;
      height: ${({ zoom }) => 40 / zoom}px;
      padding: ${({ zoom }) => 8 / zoom}px;
      ${({ theme }) => theme.fonts.normalMedium};
      font-size: ${({ zoom }) => 14 / zoom}px;
      line-height: ${({ zoom }) => 24 / zoom}px;
      background-color: ${({ theme }) => theme.colors.dark20};
      color: ${({ theme }) => theme.colors.text100};
      border-radius: ${({ zoom }) => 8 / zoom}px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    & .map-name.clickable {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &:hover::after {
    content: '';
    position: absolute;
    inset: 0;
    border: ${({ zoom }) => 2 / zoom}px solid ${({ theme }) => theme.colors.primaryBase};
    pointer-events: none;
  }
`;

const zoomSelector = (s: { transform: number[] }) => s.transform[2];

export const MapLinkNode = ({ data: { mapLink, maps, cardinal, index, tileSize }, dragging }: MapLinkNodeProps) => {
  const updateMapLink = useUpdateMapLink(mapLink);
  const getName = useGetEntityNameText();
  const currentZoom = useStore(zoomSelector);
  const isClickable = useKeyPress(CONTROL);
  const navigateMapLink = useNavigateMapLink();
  const { t } = useTranslation();
  const links = getLinksFromMapLink(mapLink, cardinal);
  const map = maps[links[index].mapId];

  const onDeleteMap = () => {
    const links = cloneEntity(getLinksFromMapLink(mapLink, cardinal));
    links.splice(index, 1);
    updateMapLink({ [`${cardinal}Maps`]: links });
  };

  return (
    <MapLinkNodeContainer dragging={dragging} style={getMapSizeStyle(map, tileSize)} zoom={currentZoom}>
      {map ? (
        <>
          <span className={`map-name ${isClickable ? 'clickable' : undefined}`} onClick={() => isClickable && navigateMapLink(map)}>
            {getName(map)}
          </span>
          <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} fallback="graphics/pictures/black" />
        </>
      ) : (
        <div className="map-deleted">{t('map_deleted')}</div>
      )}
      <ClearButtonOnlyIcon className="clear-button" onClick={onDeleteMap} />
    </MapLinkNodeContainer>
  );
};
