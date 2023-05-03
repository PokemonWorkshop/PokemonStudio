import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID, StudioTextInfo } from '@modelEntities/textInfo';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  textInfo: StudioTextInfo;
};

/**
 * Editor overlay for the Translation of text info texts
 */
export const TextTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'TextTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, textInfo }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TEXT_INFO_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? TEXT_INFO_DESCRIPTION_TEXT_ID : TEXT_INFO_NAME_TEXT_ID}
            textIndex={textInfo.textId}
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
