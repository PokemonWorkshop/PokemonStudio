import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import type { StudioTrainerClass } from '@modelEntities/trainerClass';
import { TRAINER_CLASS_DESCRIPTION_TEXT_ID, TRAINER_CLASS_NAME_TEXT_ID } from '@modelEntities/trainerClass';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  trainerClass: StudioTrainerClass;
};

/**
 * Editor overlay for the Translation of map texts
 */
export const TrainerClassTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'TrainerClassTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, trainerClass }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TRAINER_CLASS_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? TRAINER_CLASS_DESCRIPTION_TEXT_ID : TRAINER_CLASS_NAME_TEXT_ID}
            textIndex={trainerClass.id}
            isMultiline={dialogToShow === 'translation_description'}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
