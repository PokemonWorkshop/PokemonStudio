import React from 'react';
import { DexCategory } from '@components/categories';
import DexModel from '@modelEntities/dex/Dex.model';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { useTranslation } from 'react-i18next';

type DexFrameProps = {
  dex: DexModel;
  onClick: () => void;
};

export const DexFrame = ({ dex, onClick }: DexFrameProps) => {
  const { t } = useTranslation('database_dex');
  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{dex.name()}</h1>
            </DataInfoContainerHeaderTitle>
            <DexCategory category={dex.getTypeDex()}>{t(dex.getTypeDex())}</DexCategory>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
