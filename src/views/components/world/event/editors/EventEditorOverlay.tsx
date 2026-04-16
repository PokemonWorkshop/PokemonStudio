import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { DialogRefData } from '@hooks/useDialogsRef';
import { StudioEventTreeFolder, StudioEventTreeValue } from '@modelEntities/event/event-tree';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { EventDeletion } from './EventDeletion';
import { EventFolderDeletion } from './EventFolderDeletion';
import { EventNewEditor } from './EventNewEditor';

export type EventEditorAndDeletionKeys = 'new' | 'deletion_event' | 'deletion_folder';
export type EventDialogsRef = React.RefObject<DialogRefData<EventEditorAndDeletionKeys> | null>;

type Props = {
  eventValue?: StudioEventTreeValue;
};

/**
 * Editor overlay for the events.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const EventEditorOverlay = defineEditorOverlay<EventEditorAndDeletionKeys, Props>(
  'EventEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { eventValue }) => {
    switch (dialogToShow) {
      case 'new':
        return (
          <EventNewEditor
            closeDialog={closeDialog}
            ref={handleCloseRef}
            eventParent={eventValue?.data.klass === 'EventFolder' ? (eventValue as StudioEventTreeFolder) : undefined}
          />
        );

      case 'deletion_event':
        return (
          <EventDeletion
            closeDialog={closeDialog}
            ref={handleCloseRef}
            dbSymbol={eventValue?.data.klass === 'Event' ? eventValue.data.dbSymbol : undefined}
          />
        );
      case 'deletion_folder':
        return (
          <EventFolderDeletion
            closeDialog={closeDialog}
            ref={handleCloseRef}
            dbSymbol={eventValue?.data.klass === 'EventFolder' ? eventValue.data.dbSymbol : undefined}
          />
        );

      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
