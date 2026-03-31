import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { EventNewEditor } from './EventNewEditor';
import { EventDeletion } from './EventDeletion';
import { StudioEventTreeFolder, StudioEventTreeValue } from '../../../../../models/entities/event/event-tree';
import { EventFolderDeletion } from './EventFolderDeletion';

export type EventEditorAndDeletionKeys = 'new' | 'deletion_event' | 'deletion_folder';
export type EventDialogsRef = React.RefObject<DialogRefData<EventEditorAndDeletionKeys>>;

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
