import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlBar } from '@components/ControlBar';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { SelectGroup } from '@components/selects';

import { useProjectGroups } from '@utils/useProjectData';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';

import { GroupDialogsRef } from './editors/GroupEditorOverlay';

type GroupContralBarProps = {
  dialogsRef?: GroupDialogsRef;
};

export const GroupControlBar = ({ dialogsRef }: GroupContralBarProps) => {
  const { t } = useTranslation('database_groups');
  const { selectedDataIdentifier: groupDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectGroups();

  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ group: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ group: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
  }, [dialogsRef, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectGroup dbSymbol={groupDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ group: dbSymbol })} />
    </ControlBar>
  );
};
