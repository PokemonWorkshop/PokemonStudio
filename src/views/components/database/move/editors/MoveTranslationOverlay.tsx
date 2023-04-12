import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, StudioMove } from '@modelEntities/move';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  move: StudioMove;
};

/**
 * Editor overlay for the Translation of move texts
 */
export const MoveTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'MoveTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, move }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={MOVE_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? MOVE_DESCRIPTION_TEXT_ID : MOVE_NAME_TEXT_ID}
            textIndex={move.id}
            isMultiline={dialogToShow === 'translation_description'}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
