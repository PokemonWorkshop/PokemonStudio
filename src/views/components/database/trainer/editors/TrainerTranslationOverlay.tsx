import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import {
  StudioTrainer,
  TRAINER_ADDITIONAL_DIALOGS_TEXT_ID,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
} from '@modelEntities/trainer';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import type { TrainerDialogAdditionalDialogs } from './useTrainerDialog';

export type TrainerTranslationEditorTitle =
  | 'translation_name'
  | 'translation_class'
  | 'translation_victory'
  | 'translation_defeat'
  | 'translation_additional_dialog';

type Props = {
  onClose: () => void;
  trainer: StudioTrainer;
  additionalDialog?: TrainerDialogAdditionalDialogs;
};

/**
 * Editor overlay for the translation of trainer texts
 */
export const TrainerTranslationOverlay = defineEditorOverlay<TrainerTranslationEditorTitle, Props>(
  'TrainerTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, trainer, additionalDialog }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_class':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TRAINER_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_name' ? TRAINER_NAME_TEXT_ID : TRAINER_CLASS_TEXT_ID}
            textIndex={trainer.id}
            isMultiline={false}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      case 'translation_victory':
      case 'translation_defeat':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TRAINER_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_victory' ? TRAINER_VICTORY_SENTENCE_TEXT_ID : TRAINER_DEFEAT_SENTENCE_TEXT_ID}
            textIndex={trainer.id}
            isMultiline={true}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      case 'translation_additional_dialog':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={TRAINER_NAME_TEXT_ID}
            fileId={TRAINER_ADDITIONAL_DIALOGS_TEXT_ID}
            textIndex={additionalDialog?.textId ?? 0}
            isMultiline={true}
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
