import { ResourceImage } from '@components/ResourceImage';
import { join } from '@utils/path';
import React from 'react';
import styled from 'styled-components';
import { MapDialogsRef } from '../map/editors/MapEditorOverlay';
import { useOpenTiled } from '@utils/useOpenTiled';

const getOverviewPath = (tiledFilename: string) => {
  return join('Data/Tiled/Overviews', `${tiledFilename}.png`);
};

const MapOverviewNodeContainer = styled.div`
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;
`;

type MapOverviewNodeProps = {
  data: {
    tiledFilename: string;
    dialogsRef: MapDialogsRef;
  };
};

export const MapOverviewNode = ({ data }: MapOverviewNodeProps) => {
  const openTiled = useOpenTiled();
  return (
    <MapOverviewNodeContainer onDoubleClick={() => openTiled(data.tiledFilename, data.dialogsRef)}>
      <ResourceImage imagePathInProject={getOverviewPath(data.tiledFilename)} />
    </MapOverviewNodeContainer>
  );
};
