import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectDex } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { DexDialogsRef } from './editors/DexEditorOverlay';
import { useProjectDex } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';

type DexControlBarProps = {
  dialogsRef: DexDialogsRef;
};

export const DexControlBar = ({ dialogsRef }: DexControlBarProps) => {
  const { t } = useTranslation('database_dex');
  const { selectedDataIdentifier: dexDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectDex();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ dex: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ dex: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dexDbSymbol]);
  useShortcut(shortcutMap);

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={() => dialogsRef?.current?.openDialog('new')}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectDex dbSymbol={dexDbSymbol} onChange={(selected) => setSelectedDataIdentifier({ dex: selected })} />
    </ControlBar>
  );
};
