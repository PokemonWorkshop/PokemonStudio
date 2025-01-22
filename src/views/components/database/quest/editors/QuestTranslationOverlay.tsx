import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, StudioQuest } from '@modelEntities/quest';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type QuestTranslationEditorTitle = 'translation_name' | 'translation_description';

type Props = {
  onClose: () => void;
  quest: StudioQuest;
};

/**
 * Editor overlay for the Translation of quest texts
 */
export const QuestTranslationOverlay = defineEditorOverlay<QuestTranslationEditorTitle, Props>(
  'QuestTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, quest }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={QUEST_NAME_TEXT_ID}
            fileId={dialogToShow === 'translation_description' ? QUEST_DESCRIPTION_TEXT_ID : QUEST_NAME_TEXT_ID}
            textIndex={quest.id}
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
