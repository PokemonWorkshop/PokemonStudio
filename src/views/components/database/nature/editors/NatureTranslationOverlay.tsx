import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { NATURE_NAME_TEXT_ID, StudioNature } from '@modelEntities/nature';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name';

type Props = {
  onClose: () => void;
  nature: StudioNature;
};

/**
 * Editor overlay for the Translation of nature texts
 */
export const NatureTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'NatureTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, nature }) => {
    switch (dialogToShow) {
      case 'translation_name':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={NATURE_NAME_TEXT_ID}
            fileId={NATURE_NAME_TEXT_ID}
            textIndex={nature.id}
            isMultiline={false}
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
