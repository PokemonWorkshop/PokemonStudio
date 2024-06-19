import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar } from '@components/ControlBar';
import { SelectTrainer } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { useProjectTrainers } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { TrainerDialogsRef } from './editors/TrainerEditorOverlay';

type TrainerControlBarProps = {
  dialogsRef?: TrainerDialogsRef;
};

export const TrainerControlBar = ({ dialogsRef }: TrainerControlBarProps) => {
  const { t } = useTranslation('database_trainers');
  const { selectedDataIdentifier: trainerDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectTrainers();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ trainer: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ trainer: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectTrainer dbSymbol={trainerDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ trainer: dbSymbol })} />
    </ControlBar>
  );
};
