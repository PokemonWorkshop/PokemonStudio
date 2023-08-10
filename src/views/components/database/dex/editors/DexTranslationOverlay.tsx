import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { DEX_DEFAULT_NAME_TEXT_ID, StudioDex } from '@modelEntities/dex';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name';

type Props = {
  onClose: () => void;
  dex: StudioDex;
};

/**
 * Editor overlay for the Translation of Dex texts
 */
export const DexTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'DexTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, dex }) => {
    switch (dialogToShow) {
      case 'translation_name':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={DEX_DEFAULT_NAME_TEXT_ID}
            fileId={DEX_DEFAULT_NAME_TEXT_ID}
            textIndex={dex.id}
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
