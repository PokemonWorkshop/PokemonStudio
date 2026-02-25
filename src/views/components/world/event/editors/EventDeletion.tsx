import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectEvents } from '@hooks/useProjectData';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type EventDeletionProps = {
  closeDialog: () => void;
  dbSymbol?: DbSymbol;
};

/**
 * Component responsive of asking the user if they really want to delete the map before doing so.
 */
export const EventDeletion = forwardRef<EditorHandlingClose, EventDeletionProps>(({ closeDialog, dbSymbol }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: events, selectedDataIdentifier: currentDbSymbol, removeProjectDataValue: deleteEvent } = useProjectEvents();
  const currentEvent = events[dbSymbol || currentDbSymbol];
  const getEventName = useGetEntityNameText();
  const eventName = getEventName({ klass: 'Event', id: currentEvent?.id });

  const onClickDelete = () => {
    if (!dbSymbol) return;
    const firstDbSymbol = Object.entries(events)
      .map(([value, event]) => ({ value, index: event.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteEvent(dbSymbol, { event: firstDbSymbol });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_event', { event: eventName })}
      message={t('deletion_message_event', { event: eventName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
EventDeletion.displayName = 'EventDeletion';
