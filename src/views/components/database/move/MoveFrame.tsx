import React from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getNameType } from '@utils/getNameType';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import { StudioMove } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveFrameProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveFrame = ({ move, dialogsRef }: MoveFrameProps) => {
  const [state] = useGlobalState();
  const getMoveName = useGetEntityNameText();
  const getMoveDescription = useGetEntityDescriptionText();
  const { t } = useTranslation('database_moves');

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getMoveName(move)}</h1>
              <CopyIdentifier dataToCopy={move.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={move.type}>{getNameType(state.projectData.types, move.type, state)}</TypeCategory>
              <MoveCategory category={move.category}>{t(move.category)}</MoveCategory>
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{getMoveDescription(move)}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
