import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateMapLink } from '../editors';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { useStore } from '@xyflow/react';

type MapLinkNodeContainer = {
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

  &:hover {
    & .clear-button {
      position: absolute;
      display: flex;
      top: ${({ zoom }) => 4 / zoom}px;
      right: ${({ zoom }) => 4 / zoom}px;
      height: 50px;
      width: 52px;
      scale: ${({ zoom }) => 1 / zoom};
      transform-origin: top right;
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

export const MapLinkNode = ({ data: { mapLink, maps, cardinal, index, tileSize } }: MapLinkNodeProps) => {
  const updateMapLink = useUpdateMapLink(mapLink);
  const currentZoom = useStore(zoomSelector);
  const links = getLinksFromMapLink(mapLink, cardinal);
  const map = maps[links[index].mapId];

  const onDeleteMap = () => {
    const links = cloneEntity(getLinksFromMapLink(mapLink, cardinal));
    links.splice(index, 1);
    updateMapLink({ [`${cardinal}Maps`]: links });
  };

  return (
    <MapLinkNodeContainer zoom={currentZoom}>
      {map && map.tileMetadata ? (
        <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} />
      ) : (
        <div style={{ width: 20 * tileSize, height: 15 * tileSize }}>???</div>
      )}
      <ClearButtonOnlyIcon className="clear-button" onClick={onDeleteMap} />
    </MapLinkNodeContainer>
  );
};
