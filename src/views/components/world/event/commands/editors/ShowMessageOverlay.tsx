import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { CommandId, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { StudioEvent } from '@modelEntities/event/event';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { ShowMessagePortraitsEditor } from './ShowMessagePortraitsEditor';

export type ShowMessageEditorTitle = 'portraits' | 'translation_message' | 'translation_narrator';

type Props = {
  onClose: () => void;
  commandId?: CommandId;
  command: Partial<StudioEventCommandShowMessage>;
  event: StudioEvent;
};

/**
 * Editor overlay for the show message command
 */
export const ShowMessageOverlay = defineEditorOverlay<ShowMessageEditorTitle, Props>(
  'ShowMessageOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, commandId, command, event }) => {
    switch (dialogToShow) {
      case 'portraits':
        return <ShowMessagePortraitsEditor commandId={commandId} event={event} ref={handleCloseRef} />;
      case 'translation_message':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={event.csvFileId}
            fileId={event.csvFileId}
            textIndex={command.message!}
            isMultiline={true}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      case 'translation_narrator':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={event.csvFileId}
            fileId={event.csvFileId}
            textIndex={command.narrator!}
            isMultiline={false}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
