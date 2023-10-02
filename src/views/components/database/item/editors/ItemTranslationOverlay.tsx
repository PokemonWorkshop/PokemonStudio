import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { ITEM_DESCRIPTION_TEXT_ID, ITEM_NAME_TEXT_ID, ITEM_PLURAL_NAME_TEXT_ID, StudioItem } from '@modelEntities/item';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_name_plural' | 'translation_description';

type Props = {
  item: StudioItem;
  onClose: () => void;
};

const fileIdByTitle: Array<{ dialog: TranslationEditorTitle } & { id: number }> = [
  { dialog: 'translation_name', id: ITEM_NAME_TEXT_ID },
  { dialog: 'translation_name_plural', id: ITEM_PLURAL_NAME_TEXT_ID },
  { dialog: 'translation_description', id: ITEM_DESCRIPTION_TEXT_ID },
];

/**
 * Editor overlay for the Translation of Item texts
 */
export const ItemTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'ItemTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, item }) => {
    const textId = fileIdByTitle.find((file) => file.dialog === dialogToShow)?.id || ITEM_NAME_TEXT_ID;
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_name_plural':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={textId}
            fileId={textId}
            textIndex={item.id}
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
