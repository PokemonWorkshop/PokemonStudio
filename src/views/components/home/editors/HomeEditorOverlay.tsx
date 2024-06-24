import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { HomeProjectNewEditor } from './HomeProjectNewEditor';

export type HomeEditorAndDeletionKeys = 'new_project';
export type HomeDialogsRef = React.RefObject<DialogRefData<HomeEditorAndDeletionKeys>>;

/**
 * Editor overlay for the home page.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const HomeEditorOverlay = defineEditorOverlay<HomeEditorAndDeletionKeys>('HomeEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'new_project':
      return <HomeProjectNewEditor ref={handleCloseRef} closeDialog={closeDialog} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
