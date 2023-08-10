import React from 'react';
import { DexCategory } from '@components/categories';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { CopyIdentifier } from '@components/Copy';
import { useGetEntityNameUsingCSV } from '@utils/ReadingProjectText';
import { StudioDex, StudioDexType } from '@modelEntities/dex';
import { DexDialogsRef } from './editors/DexEditorOverlay';

type DexFrameProps = {
  dex: StudioDex;
  dialogsRef: DexDialogsRef;
};

const getDexType = (dex: StudioDex): StudioDexType => (dex.dbSymbol === 'national' ? 'national' : 'regional');

export const DexFrame = ({ dex, dialogsRef }: DexFrameProps) => {
  const { t } = useTranslation('database_dex');
  const getDexName = useGetEntityNameUsingCSV();
  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getDexName(dex)}</h1>
              <CopyIdentifier dataToCopy={dex.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DexCategory category={getDexType(dex)}>{t(getDexType(dex))}</DexCategory>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
