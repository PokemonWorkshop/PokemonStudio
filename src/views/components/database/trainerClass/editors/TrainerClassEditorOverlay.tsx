import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import type { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { TrainerClassDeletion, TrainerClassFrameEditor, TrainerClassNewEditor } from '.';

export type TrainerClassEditorAndDeletionKeys = 'new' | 'frame' | 'deletion';
export type TrainerClassDialogsRef = React.RefObject<DialogRefData<TrainerClassEditorAndDeletionKeys> | null>;

export const TrainerClassEditorOverlay = defineEditorOverlay<TrainerClassEditorAndDeletionKeys>(
  'TrainerClassEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
        return <TrainerClassNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'frame':
        return <TrainerClassFrameEditor ref={handleCloseRef} />;
      case 'deletion':
        return <TrainerClassDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
