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
      top: 8px;
      right: 8px;
      height: 50px;
      width: 52px;
      scale: ${({ zoom }) => 1.0 / zoom};
      transform-origin: top right;
    }
  }
`;

type MapLinkNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
    cardinal: StudioMapLinkCardinal;
    index: number;
  };
};

const zoomSelector = (s: { transform: number[] }) => s.transform[2];

export const MapLinkNode = ({ data: { mapLink, maps, cardinal, index } }: MapLinkNodeProps) => {
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
      {map ? <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} /> : <div>???</div>}
      <ClearButtonOnlyIcon className="clear-button" onClick={onDeleteMap} />
    </MapLinkNodeContainer>
  );
};
