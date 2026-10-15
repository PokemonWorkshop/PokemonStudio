import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar } from '@components/ControlBar';
import { SelectTrainerClass } from '@components/selects';
import { useProjectTrainerClasses } from '@hooks/useProjectData';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrainerClassDialogsRef } from './editors/TrainerClassEditorOverlay';

type TrainerClassControlBarProps = {
  dialogsRef?: TrainerClassDialogsRef;
};

export const TrainerClassControlBar = ({ dialogsRef }: TrainerClassControlBarProps) => {
  const { t } = useTranslation();
  const {
    selectedDataIdentifier: trainerClassDbSymbol,
    setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectTrainerClasses();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ trainerClass: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ trainerClass: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerClassDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new_trainer_class')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectTrainerClass dbSymbol={trainerClassDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ trainerClass: dbSymbol })} />
    </ControlBar>
  );
};
