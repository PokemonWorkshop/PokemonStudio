import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import {
  QUEST_CUSTOM_OBJECTIVE_TEXT_ID,
  QUEST_DESCRIPTION_TEXT_ID,
  QUEST_NAME_TEXT_ID,
  StudioQuest,
  StudioQuestObjective,
} from '@modelEntities/quest';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type QuestTranslationEditorTitle = 'translation_name' | 'translation_description' | 'translation_custom_objective';

type Props = {
  onClose: () => void;
  quest: StudioQuest;
  objective?: StudioQuestObjective;
};

/**
 * Editor overlay for the Translation of quest texts
 */
export const QuestTranslationOverlay = defineEditorOverlay<QuestTranslationEditorTitle, Props>(
  'QuestTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, quest, objective }) => {
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
      case 'translation_custom_objective':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={QUEST_NAME_TEXT_ID}
            fileId={QUEST_CUSTOM_OBJECTIVE_TEXT_ID}
            textIndex={objective ? (objective.objectiveMethodArgs[0] as number) : 0}
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
