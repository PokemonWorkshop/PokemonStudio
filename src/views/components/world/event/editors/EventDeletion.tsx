import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectEvents } from '@hooks/useProjectData';
import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { removeEventTreeItem } from '@utils/events/EventTreeUtils';
import React, { forwardRef, useMemo } from 'react';
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

  const entityName = useMemo(
    () =>
      events[dbSymbol || currentDbSymbol]?.id ? getEventName({ klass: 'Event', id: events[dbSymbol || currentDbSymbol]?.id }) : t('event_deleted'),
    [],
  );

  const onClickDelete = () => {
    if (!dbSymbol) return;

    const firstDbSymbol = Object.entries(events)
      .map(([value, event]) => ({ value, index: event.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0]?.value as DbSymbol | undefined;
    deleteEvent(dbSymbol, { event: firstDbSymbol ?? ('__undef__' as DbSymbol) });

    setEventTree(removeEventTreeItem(eventTree, dbSymbol));
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_event', { event: entityName })}
      message={t('deletion_message_event', { event: entityName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
EventDeletion.displayName = 'EventDeletion';
