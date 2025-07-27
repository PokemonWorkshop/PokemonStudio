import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';

const MainMapLinkNodeContainer = styled.div`
  display: inline-block;
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;
  margin: 16px 0px 0px 16px;

  & img {
    display: block;
  }
`;

type MainMapLinkNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
  };
};

export const MainMapLinkNode = ({ data }: MainMapLinkNodeProps) => {
  const map = data.maps[data.mapLink.mapId];
  return (
    <MainMapLinkNodeContainer>
      {map ? <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} /> : <div>???</div>}
    </MainMapLinkNodeContainer>
  );
};
