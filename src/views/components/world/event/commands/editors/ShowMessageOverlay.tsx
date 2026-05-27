import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { CommandId } from '@modelEntities/event/command';
import { StudioEvent } from '@modelEntities/event/event';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { ShowMessagePortraitsEditor } from './ShowMessagePortraitsEditor';

export type ShowMessageEditorTitle = 'portraits' | 'translation_message' | 'translation_narrator';

type Props = {
  onClose: () => void;
  commandId?: CommandId;
  event: StudioEvent;
};

/**
 * Editor overlay for the show message command
 */
export const ShowMessageOverlay = defineEditorOverlay<ShowMessageEditorTitle, Props>(
  'ShowMessageOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, commandId, event }) => {
    switch (dialogToShow) {
      case 'portraits':
        return <ShowMessagePortraitsEditor commandId={commandId} event={event} ref={handleCloseRef} />;
      case 'translation_message':
      case 'translation_narrator':
        return <div />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
