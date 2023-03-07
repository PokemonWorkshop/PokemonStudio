import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID, StudioAbility } from '@modelEntities/ability';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  ability: StudioAbility;
};

/**
 * Editor overlay for the Translation of ability texts
 */
export const AbilityTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'AbilityTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, ability }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={ABILITY_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? ABILITY_DESCRIPTION_TEXT_ID : ABILITY_NAME_TEXT_ID}
            textIndex={ability.textId}
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
