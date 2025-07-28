import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';

const MapLinkNodeContainer = styled.div`
  display: inline-block;
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;

  & img {
    display: block;
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

export const MapLinkNode = ({ data: { mapLink, maps, cardinal, index } }: MapLinkNodeProps) => {
  const links = getLinksFromMapLink(mapLink, cardinal);
  const map = maps[links[index].mapId];

  return (
    <MapLinkNodeContainer>
      {map ? <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} /> : <div>???</div>}
    </MapLinkNodeContainer>
  );
};
