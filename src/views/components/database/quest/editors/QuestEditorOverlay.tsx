import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import type { DialogRefData } from '@hooks/useDialogsRef';
import {
  QuestDeletion,
  QuestEarningEditor,
  QuestEarningImportEditor,
  QuestFrameEditor,
  QuestGoalEditor,
  QuestGoalImportEditor,
  QuestNewEarningEditor,
  QuestNewEditor,
  QuestNewGoalEditor,
} from '.';

export type QuestEditorAndDeletionKeys =
  | 'new'
  | 'frame'
  | 'deletion'
  | 'goal'
  | 'goal_new'
  | 'goal_import'
  | 'earning'
  | 'earning_new'
  | 'earning_import'
  | 'goal_deletion'
  | 'earning_deletion';
export type QuestDialogsRef = React.RefObject<DialogRefData<QuestEditorAndDeletionKeys>>;

/**
 * Editor overlay for the quests.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const QuestEditorOverlay = defineEditorOverlay<
  QuestEditorAndDeletionKeys,
  {
    goalIndex: number;
    earningIndex: number;
  }
>('QuestEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'new':
      return <QuestNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <QuestFrameEditor ref={handleCloseRef} />;
    case 'deletion':
      return <QuestDeletion type="quest" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'goal':
      return <QuestGoalEditor ref={handleCloseRef} objectiveIndex={props.goalIndex} />;
    case 'goal_new':
      return <QuestNewGoalEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'goal_import':
      return <QuestGoalImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'goal_deletion':
      return <QuestDeletion type="goals" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'earning':
      return <QuestEarningEditor ref={handleCloseRef} earningIndex={props.earningIndex} />;
    case 'earning_new':
      return <QuestNewEarningEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'earning_import':
      return <QuestEarningImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'earning_deletion':
      return <QuestDeletion type="earnings" closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
