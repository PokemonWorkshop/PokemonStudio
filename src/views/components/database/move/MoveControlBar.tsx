import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar } from '@components/ControlBar';
import { SelectMove } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { useProjectMoves } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveControlBarProps = {
  dialogsRef?: MoveDialogsRef;
};

export const MoveControlBar = ({ dialogsRef }: MoveControlBarProps) => {
  const { t } = useTranslation('database_moves');
  const { selectedDataIdentifier: moveDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectMoves();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ move: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ move: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectMove dbSymbol={moveDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ move: dbSymbol })} />
    </ControlBar>
  );
};
