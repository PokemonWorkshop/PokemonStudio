import { TypeCategory } from '@components/categories';
import { TypeCategoryIcon } from '@components/categories/TypeCategoryIcon';
import React from 'react';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import { TypeFrameProps } from './TypeDataPropsInterface';
import { CopyIdentifier } from '@components/Copy';

export const TypeFrame = ({ type, onClick }: TypeFrameProps) => {
  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 692px) auto">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{type.name()}</h1>
              <CopyIdentifier dataToCopy={type.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={type.dbSymbol}>{type.name()}</TypeCategory>
              <TypeCategoryIcon type={type.dbSymbol} />
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
