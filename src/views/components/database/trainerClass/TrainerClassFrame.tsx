import { CopyIdentifier } from '@components/Copy';
import { StudioTrainerClass } from '@modelEntities/trainerClass';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { TrainerClassDialogsRef } from './editors/TrainerClassEditorOverlay';

type TrainerClassFrameProps = {
  trainerClass: StudioTrainerClass;
  dialogsRef: TrainerClassDialogsRef;
};

export const TrainerClassFrame = ({ trainerClass, dialogsRef }: TrainerClassFrameProps) => {
  const getTrainerClassName = useGetEntityNameText();
  const getTrainerClassDescription = useGetEntityDescriptionText();

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getTrainerClassName(trainerClass)}</h1>
              <CopyIdentifier dataToCopy={trainerClass.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <p>{getTrainerClassDescription(trainerClass)}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
