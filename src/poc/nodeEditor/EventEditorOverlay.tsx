import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { BasicEditor } from './BasicEditor';
import { StudioEventCommand } from '@modelEntities/event/command';

export type EventEditorAndDeletionKeys = StudioEventCommand;
export type EventDialogsRef = React.RefObject<DialogRefData<EventEditorAndDeletionKeys>>;

/**
 * Editor overlay for the events.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const EventEditorOverlay = defineEditorOverlay<EventEditorAndDeletionKeys>(
  'eventEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'add_condition':
      case 'add_jump_another_command':
      case 'call_event':
      case 'insert_loop':
      case 'show_message':
      case 'stop_event_execution':
        return <BasicEditor ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
