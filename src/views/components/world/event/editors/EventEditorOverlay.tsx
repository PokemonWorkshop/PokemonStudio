import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { StudioEventTreeValue } from '../../../../../models/entities/event/event';
import { EventNewEditor } from './EventNewEditor';
import { EventDeletion } from './EventDeletion';

export type EventEditorAndDeletionKeys = 'new' | 'deletion_event' | 'deletion_folder';
export type EventDialogsRef = React.RefObject<DialogRefData<EventEditorAndDeletionKeys>>;

type Props = {
  eventValue?: StudioEventTreeValue;
};

/**
 * Editor overlay for the maps.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const EventTreeEditorOverlay = defineEditorOverlay<EventEditorAndDeletionKeys, Props>(
  'MapEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { eventValue }) => {
    switch (dialogToShow) {
      case 'new':
        return <EventNewEditor closeDialog={closeDialog} ref={handleCloseRef}></EventNewEditor>;

      case 'deletion_event':
        return <EventDeletion closeDialog={closeDialog} ref={handleCloseRef} dbSymbol={eventValue?.data.dbSymbol} />;
      case 'deletion_folder':
        return <EventDeletion closeDialog={closeDialog} ref={handleCloseRef} dbSymbol={eventValue?.data.dbSymbol} />;

      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
