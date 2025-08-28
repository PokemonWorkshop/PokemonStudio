import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DeleteButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import theme from '@src/AppTheme';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { useShortcutNavigation } from '@hooks/useShortcutNavigation';
import { MoveCondition } from '@components/categories/MoveCondition';
import { DataCombosGrid } from './MoveContestCombosTableStyle';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useProjectMoves } from '@src/hooks/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';

const RenderComboMoveContainer = styled(DataCombosGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;

  & .buttons:nth-child(3) {
    display: flex;
    gap: 4px;
    justify-content: end;
    align-items: center;
    visibility: hidden;
  }

  &:hover {
    .buttons:nth-child(3) {
      visibility: visible;
    }
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  ${EditButtonOnlyIconContainer} {
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }
`;

type RenderComboMoveProps = {
  moveSymbol: DbSymbol;
  onClickDelete: () => void;
};

export const RenderComboMove = ({ moveSymbol, onClickDelete }: RenderComboMoveProps) => {
  const getMoveName = useGetEntityNameText();
  const { projectDataValues: moves } = useProjectMoves();
  const move = moves[moveSymbol];
  const { t } = useTranslation();
  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutMoveNavigation = useShortcutNavigation('moves', 'move', '/database/moves/');

  return (
    <RenderComboMoveContainer gap="48px">
      {move ? (
        <>
          <span onClick={isClickable ? () => shortcutMoveNavigation(move.dbSymbol) : undefined} className={isClickable ? 'clickable' : undefined}>
            {getMoveName(move)}
          </span>
          <MoveCondition condition={move.condition}>{t(move.condition)}</MoveCondition>
          <div className="buttons">
            <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
          </div>
        </>
      ) : (
        <>
          <span style={{ color: theme.colors.dangerBase }}>{t('move_deleted')}</span>
          <span></span>
          <div className="buttons">
            <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
          </div>
        </>
      )}
    </RenderComboMoveContainer>
  );
};
