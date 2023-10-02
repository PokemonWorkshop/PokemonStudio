import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectItem } from '@components/selects';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useProjectItems } from '@utils/useProjectData';
import { useItemPage } from '@utils/usePage';

type ItemControlBarProps = {
  dialogsRef: ItemDialogsRef;
};

export const ItemControlBar = ({ dialogsRef }: ItemControlBarProps) => {
  const { itemDbSymbol } = useItemPage();
  const { t } = useTranslation('database_items');
  const { setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectItems();

  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;

    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ item: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ item: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
  }, [dialogsRef, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectItem dbSymbol={itemDbSymbol} onChange={(value) => setSelectedDataIdentifier({ item: value })} />
    </ControlBar>
  );
};
