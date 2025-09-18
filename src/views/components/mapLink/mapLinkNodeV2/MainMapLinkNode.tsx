import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';
import { useStore } from '@xyflow/react';

type MainMapLinkNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
  };
};

type MapLinkNodeContainer = {
  zoom: number;
};

const MainMapLinkNodeContainer = styled.div<MapLinkNodeContainer>`
  display: inline-block;
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;

  & img {
    display: block;
  }

  .react-flow__node.selected &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: ${({ zoom }) => 2 / zoom}px solid ${({ theme }) => theme.colors.primaryBase};
    pointer-events: none;
  }
`;

const zoomSelector = (s: { transform: number[] }) => s.transform[2];

export const MainMapLinkNode = ({ data }: MainMapLinkNodeProps) => {
  const currentZoom = useStore(zoomSelector);
  const map = data.maps[data.mapLink.mapId];
  return (
    <MainMapLinkNodeContainer zoom={currentZoom}>
      {map ? <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} /> : <div>???</div>}
    </MainMapLinkNodeContainer>
  );
};
