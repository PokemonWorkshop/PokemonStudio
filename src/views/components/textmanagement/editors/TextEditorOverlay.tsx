import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { TextDeletion } from './TextDeletion';
import { TextFrameEditor, TextImportEditor, TextNewEditor } from '.';

export type TextEditorAndDeletionKeys = 'new' | 'frame' | 'import' | 'deletion';
export type TextDialogsRef = React.RefObject<DialogRefData<TextEditorAndDeletionKeys>>;

/**
 * Editor overlay for the texts managements.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const TextEditorOverlay = defineEditorOverlay<TextEditorAndDeletionKeys>('TextEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'new':
      return <TextNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <TextFrameEditor ref={handleCloseRef} />;
    case 'import':
      return <TextImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'deletion':
      return <TextDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
