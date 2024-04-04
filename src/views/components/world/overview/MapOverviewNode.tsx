import { ResourceImage } from '@components/ResourceImage';
import { join } from '@utils/path';
import React from 'react';
import styled from 'styled-components';
import { MapDialogsRef } from '../map/editors/MapEditorOverlay';
import { useOpenTiled } from '@utils/useOpenTiled';
import { StudioMap } from '@modelEntities/map';

const getOverviewPath = (tiledFilename: string) => {
  return join('Data/Tiled/Overviews', `${tiledFilename}.png`);
};

const MapOverviewNodeContainer = styled.div`
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;
`;

type MapOverviewNodeProps = {
  data: {
    map: StudioMap;
    dialogsRef: MapDialogsRef;
  };
};

export const MapOverviewNode = ({ data }: MapOverviewNodeProps) => {
  const openTiled = useOpenTiled();
  const map = data.map;

  return (
    <MapOverviewNodeContainer onDoubleClick={() => openTiled(map.tiledFilename, data.dialogsRef)}>
      <ResourceImage imagePathInProject={getOverviewPath(map.tiledFilename)} versionId={map.mtime} />
    </MapOverviewNodeContainer>
  );
};
