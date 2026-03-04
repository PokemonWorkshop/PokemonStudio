import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectEvents } from '@hooks/useProjectData';
import { useEventTree } from '@hooks/useEventTree';
import { getEventTreeChildrenDbSymbols, removeEventTreeItem } from '@utils/events/EventUtils';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type EventDeletionProps = {
  closeDialog: () => void;
  dbSymbol?: DbSymbol;
};

/**
 * Component responsible for asking the user if they really want to delete the event or folder before doing so.
 */
export const EventDeletion = forwardRef<EditorHandlingClose, EventDeletionProps>(({ closeDialog, dbSymbol }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: events, selectedDataIdentifier: currentDbSymbol, removeProjectDataValue: deleteEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const getEventName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();

  const eventTreeItem = eventTree[dbSymbol || currentDbSymbol];
  const isFolder = eventTreeItem?.data.klass === 'EventFolder';

  const entityName = isFolder
    ? getFolderName({ klass: 'EventFolder', textId: (eventTreeItem.data as { klass: 'EventFolder'; dbSymbol: DbSymbol; id: number }).id })
    : getEventName({ klass: 'Event', id: events[dbSymbol || currentDbSymbol]?.id });

  const onClickDelete = () => {
    if (!dbSymbol) return;

    if (isFolder) {
      const childDbSymbols = getEventTreeChildrenDbSymbols(eventTree, eventTreeItem);
      const fallbackDbSymbol = Object.keys(events).find((k) => !childDbSymbols.includes(k)) as DbSymbol | undefined;
      childDbSymbols.forEach((childDbSymbol) => {
        if (events[childDbSymbol] && fallbackDbSymbol) {
          deleteEvent(childDbSymbol as DbSymbol, { event: fallbackDbSymbol });
        }
      });
    } else {
      const firstDbSymbol = Object.entries(events)
        .map(([value, event]) => ({ value, index: event.id }))
        .filter((d) => d.value !== dbSymbol)
        .sort((a, b) => a.index - b.index)[0]?.value as DbSymbol | undefined;
      deleteEvent(dbSymbol, { event: firstDbSymbol ?? ('__undef__' as DbSymbol) });
    }

    setEventTree(removeEventTreeItem(eventTree, dbSymbol));
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={isFolder ? t('deletion_of_folder', { folder: entityName }) : t('deletion_of_event', { event: entityName })}
      message={isFolder ? t('deletion_message_folder', { folder: entityName }) : t('deletion_message_event', { event: entityName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
EventDeletion.displayName = 'EventDeletion';
