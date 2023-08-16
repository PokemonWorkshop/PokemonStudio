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
import { CopyIdentifier } from '@components/Copy';
import { useTypePage } from '@utils/usePage';
import { TypeDialogsRef } from './editors/TypeEditorOverlay';

export const TypeFrame = ({ dialogsRef }: { dialogsRef: TypeDialogsRef }) => {
  const { currentTypeName, typeDbSymbol } = useTypePage();
  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 692px) auto">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{currentTypeName}</h1>
              <CopyIdentifier dataToCopy={typeDbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={typeDbSymbol}>{currentTypeName}</TypeCategory>
              <TypeCategoryIcon type={typeDbSymbol}></TypeCategoryIcon>
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
