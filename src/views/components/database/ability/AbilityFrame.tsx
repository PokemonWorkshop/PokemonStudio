import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { AbilityDataProps } from './AbilityDataPropsInterface';
import { CopyIdentifier } from '@components/Copy';

export const AbilityFrame = ({ ability, onClick }: AbilityDataProps) => {
  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{ability.name()}</h1>
              <CopyIdentifier dataToCopy={ability.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <p>{ability.descr()}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
