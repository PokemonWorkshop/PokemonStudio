import React from 'react';
import { CopyIdentifier } from '@components/Copy';
import { DataBlockContainer, DataGrid, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { StudioNature } from '@modelEntities/nature';
import { NatureDialogsRef } from './editors/NatureEditorOverlay';
import { padStr } from '@utils/PadStr';

type NatureFrameProps = {
  nature: StudioNature;
  natureName: string;
  dialogsRef: NatureDialogsRef;
};

export const NatureFrame = ({ nature, natureName, dialogsRef }: NatureFrameProps) => {
  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainerHeaderTitle>
          <h1>
            {natureName}
            <span className="data-id">#{padStr(nature.id, 3)}</span>
          </h1>
          <CopyIdentifier dataToCopy={nature.dbSymbol} />
        </DataInfoContainerHeaderTitle>
      </DataGrid>
    </DataBlockContainer>
  );
};
