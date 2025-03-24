import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectZone } from '@components/selects';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { ZoneDialogsRef } from './editors/ZoneEditorOverlay';
import { useProjectZones } from '@src/hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@src/hooks/useShortcuts';

type ZoneControlBarProps = {
  dialogsRef?: ZoneDialogsRef;
};

export const ZoneControlBar = ({ dialogsRef }: ZoneControlBarProps) => {
  const { t } = useTranslation('database_zones');
  const { selectedDataIdentifier: zoneDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectZones();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ zone: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ zone: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectZone dbSymbol={zoneDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ zone: dbSymbol })} />
    </ControlBar>
  );
};
