import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { StudioType, TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name';

type Props = {
  type: StudioType;
  onClose: () => void;
};

/**
 * Editor overlay for the Translation of Type texts
 */
export const TypeTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'TypeTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, type }) => {
    switch (dialogToShow) {
      case 'translation_name':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TYPE_NAME_TEXT_ID}
            fileId={TYPE_NAME_TEXT_ID}
            textIndex={type.textId}
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
