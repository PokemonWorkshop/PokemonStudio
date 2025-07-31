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
import { padStr } from '@utils/PadStr';
import { MoveCondition } from '@components/categories/MoveCondition';

type MoveFrameProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
  contest: boolean;
};

export const MoveFrame = ({ move, dialogsRef, contest }: MoveFrameProps) => {
  const [state] = useGlobalState();
  const getMoveName = useGetEntityNameText();
  const getMoveDescription = useGetEntityDescriptionText();
  const { t } = useTranslation();

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog(contest ? 'frame_contest' : 'frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {move && getMoveName(move)}
                <span className="data-id">#{padStr(move?.id, 3)}</span>
              </h1>
              <CopyIdentifier dataToCopy={move.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            {contest ? (
              <DataInfoContainerHeaderBadges>
                <MoveCondition condition={move.contestData.condition}>{t(move.contestData.condition)}</MoveCondition>
              </DataInfoContainerHeaderBadges>
            ) : (
              <DataInfoContainerHeaderBadges>
                <TypeCategory type={move.type}>{getNameType(state.projectData.types, move.type, state)}</TypeCategory>
                <MoveCategory category={move.category}>{t(move.category)}</MoveCategory>
              </DataInfoContainerHeaderBadges>
            )}
          </DataInfoContainerHeader>
          <p>{contest ? getMoveDescription(move) : getMoveDescription(move)}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
