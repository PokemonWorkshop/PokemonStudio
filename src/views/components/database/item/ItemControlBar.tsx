import { SecondaryButton, SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectItem } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useNavigate } from 'react-router-dom';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { useProjectItems } from '@hooks/useProjectData';
import { useItemPage } from '@hooks/usePage';

type ItemControlBarProps = {
  dialogsRef: ItemDialogsRef;
  onRedirect?: 'table';
};

export const ItemControlBar = ({ dialogsRef, onRedirect }: ItemControlBarProps) => {
  const { itemDbSymbol } = useItemPage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectItems();

  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;

    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ item: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ item: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog(onRedirect === 'table' ? 'newTable' : 'newItem'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogsRef, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog(onRedirect === 'table' ? 'newTable' : 'newItem') : undefined;

  return (
    <ControlBar>
      <ControlBarLabelContainer>
        <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new_item')}</SecondaryButtonWithPlusIcon>
        {onRedirect !== 'table' && (
          <SecondaryButton onClick={() => navigate(`/database/items/techItemsTable`)}>{t('handle_tech_list')}</SecondaryButton>
        )}
      </ControlBarLabelContainer>
      {onRedirect !== 'table' && <SelectItem dbSymbol={itemDbSymbol} onChange={(value) => setSelectedDataIdentifier({ item: value })} />}
    </ControlBar>
  );
};
