import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type ShowChoiceEditorTitle = 'translation_choice';

type Props = {
  onClose: () => void;
  csvFileId: number;
  choiceIndex?: number;
};

/**
 * Editor overlay for the show message command
 */
export const ShowChoiceOverlay = defineEditorOverlay<ShowChoiceEditorTitle, Props>(
  'ShowChoiceOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, csvFileId, choiceIndex }) => {
    switch (dialogToShow) {
      case 'translation_choice': {
        if (choiceIndex === undefined) throw new Error('Undefined choice index.');

        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={csvFileId}
            fileId={csvFileId}
            textIndex={choiceIndex}
            isMultiline={false}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      }
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
