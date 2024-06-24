import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { useProjectItems } from '@hooks/useProjectData';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type ItemDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the item before doing so.
 */
export const ItemDeletion = forwardRef<EditorHandlingClose, ItemDeletionProps>(({ closeDialog }, ref) => {
  const { items, itemDbSymbol, currentItemName } = useItemPage();
  const { t } = useTranslation('database_items');
  const { removeProjectDataValue: deleteItem } = useProjectItems();

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(items)
      .map(([value, itemData]) => ({ value, index: itemData.id }))
      .filter((d) => d.value !== itemDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    // delay because we can delete 2 or more item
    setTimeout(() => {
      deleteItem(itemDbSymbol, { item: firstDbSymbol });
    }, 200);
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { item: currentItemName })}
      message={t('deletion_message', { item: currentItemName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
ItemDeletion.displayName = 'ItemDeletion';
