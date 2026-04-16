import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { TextFrameEditor, TextImportEditor, TextNewEditor } from '.';
import { TextDeletion } from './TextDeletion';
import { TextListClear } from './TextListClear';

export type TextEditorAndDeletionKeys = 'new' | 'frame' | 'import' | 'deletion' | 'clear';
export type TextDialogsRef = React.RefObject<DialogRefData<TextEditorAndDeletionKeys> | null>;

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
    case 'clear':
      return <TextListClear closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
