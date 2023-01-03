import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { AbilityDataProps } from './AbilityDataPropsInterface';
import { CopyIdentifier } from '@components/Copy';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

export const AbilityFrame = ({ ability, onClick }: AbilityDataProps) => {
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getName(ability)}</h1>
              <CopyIdentifier dataToCopy={ability.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <p>{getDescription(ability)}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
