import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID, StudioMap } from '@modelEntities/map';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  map: StudioMap;
};

/**
 * Editor overlay for the Translation of map texts
 */
export const MapTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'MapTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, map }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={MAP_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? MAP_DESCRIPTION_TEXT_ID : MAP_NAME_TEXT_ID}
            textIndex={map.id}
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
