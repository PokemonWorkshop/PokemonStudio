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
  command: Omit<StudioEventCommandShowMessage, 'type' | 'connections' | 'studioData'>;
  csvFileId: number;
  event?: StudioEvent;
  commandId?: CommandId;
};

/**
 * Editor overlay for the show message command
 */
export const ShowMessageOverlay = defineEditorOverlay<ShowMessageEditorTitle, Props>(
  'ShowMessageOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, commandId, command, csvFileId, event }) => {
    switch (dialogToShow) {
      case 'portraits': {
        if (!event) throw new Error('The event should be defined to call the portraits editor.');

        return <ShowMessagePortraitsEditor commandId={commandId} event={event} ref={handleCloseRef} />;
      }
      case 'translation_message':
      case 'translation_narrator':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={csvFileId}
            fileId={csvFileId}
            textIndex={dialogToShow === 'translation_message' ? command.message : command.narrator}
            isMultiline={dialogToShow === 'translation_message'}
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
