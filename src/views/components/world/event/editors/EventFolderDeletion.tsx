import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectEvents } from '@hooks/useProjectData';
import { useEventTree } from '@hooks/useEventTree';
import { getEventTreeChildrenDbSymbols, removeEventTreeItem } from '@utils/events/EventUtils';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type EventFolderDeletionProps = {
  closeDialog: () => void;
  dbSymbol?: DbSymbol;
};

/**
 * Component responsible for asking the user if they really want to delete the folder before doing so.
 * Deletes all child events and removes the folder from the event tree.
 */
export const EventFolderDeletion = forwardRef<EditorHandlingClose, EventFolderDeletionProps>(({ closeDialog, dbSymbol }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: events, removeProjectDataValue: deleteEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const getFolderName = useGetEntityNameTextUsingTextId();

  const folderTreeItem = dbSymbol ? eventTree[dbSymbol] : undefined;
  const folderName = folderTreeItem?.data.klass === 'EventFolder' ? getFolderName({ klass: 'EventFolder', textId: folderTreeItem.data.id }) : '';

  const onClickDelete = () => {
    if (!dbSymbol || !folderTreeItem) return;

    const childDbSymbols = getEventTreeChildrenDbSymbols(eventTree, folderTreeItem);
    const fallbackDbSymbol = Object.keys(events).find((k) => !childDbSymbols.includes(k)) as DbSymbol | undefined;
    childDbSymbols.forEach((childDbSymbol) => {
      if (events[childDbSymbol]) {
        deleteEvent(childDbSymbol as DbSymbol, { event: fallbackDbSymbol ?? ('__undef__' as DbSymbol) });
      }
    });

    setEventTree(removeEventTreeItem(eventTree, dbSymbol));
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_folder', { folder: folderName })}
      message={t('deletion_message_folder', { folder: folderName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
EventFolderDeletion.displayName = 'EventFolderDeletion';
