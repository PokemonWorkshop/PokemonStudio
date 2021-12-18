import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeaderTitle } from '../dataBlocks';
import ZoneModel from '@modelEntities/zone/Zone.model';
import styled from 'styled-components';

const DataZoneContainer = styled(DataInfoContainer)`
  gap: 8px;
`;

type ZoneFrameProps = {
  zone: ZoneModel;
  onClick: () => void;
};

export const ZoneFrame = ({ zone, onClick }: ZoneFrameProps) => {
  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataZoneContainer>
          <DataInfoContainerHeaderTitle>
            <h1>{zone.name()}</h1>
          </DataInfoContainerHeaderTitle>
          <p>{zone.descr()}</p>
        </DataZoneContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
