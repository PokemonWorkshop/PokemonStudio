import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { StudioZone, ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { assertUnreachable } from '@utils/assertUnreachable';

export type ZoneTranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  zone: StudioZone;
};

/**
 * Editor overlay for the Translation of quest texts
 */
export const ZoneTranslationOverlay = defineEditorOverlay<ZoneTranslationEditorTitle, Props>(
  'ZoneTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, zone }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={ZONE_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? ZONE_DESCRIPTION_TEXT_ID : ZONE_NAME_TEXT_ID}
            textIndex={zone.id}
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
