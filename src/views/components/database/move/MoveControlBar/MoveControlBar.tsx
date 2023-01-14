import React from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { MoveControlBarProps } from './MoveControlBarPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectMove } from '@components/selects';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

export const MoveControlBar = ({ onMoveChange, move, onClickNewMove }: MoveControlBarProps) => {
  const { t } = useTranslation(['database_moves']);
  useSetCurrentDatabasePath();

  return (
    <ControlBar>
      {onClickNewMove ? (
        <SecondaryButtonWithPlusIcon onClick={onClickNewMove}>
          <span>{t('database_moves:new')}</span>
        </SecondaryButtonWithPlusIcon>
      ) : (
        <div />
      )}
      <SelectMove dbSymbol={move.dbSymbol} onChange={onMoveChange} />
    </ControlBar>
  );
};
