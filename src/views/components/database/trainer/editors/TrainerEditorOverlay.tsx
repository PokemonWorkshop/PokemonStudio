import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import type { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { TrainerDeletion, TrainerDialogEditor, TrainerFrameEditor, TrainerNewEditor } from '.';

export type TrainerEditorAndDeletionKeys = 'new' | 'frame' | 'dialog' | 'deletion';
export type TrainerDialogsRef = React.RefObject<DialogRefData<TrainerEditorAndDeletionKeys> | null>;

/**
 * Editor overlay for the trainers.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const TrainerEditorOverlay = defineEditorOverlay<TrainerEditorAndDeletionKeys>(
  'TrainerEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
        return <TrainerNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'frame':
        return <TrainerFrameEditor ref={handleCloseRef} />;
      case 'dialog':
        return <TrainerDialogEditor ref={handleCloseRef} />;
      case 'deletion':
        return <TrainerDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
