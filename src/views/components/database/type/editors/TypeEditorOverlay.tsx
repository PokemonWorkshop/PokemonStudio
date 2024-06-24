import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { TypeDeletionEditor, TypeFrameEditor, TypeNewEditor } from '.';

export type TypeEditorAndDeletionKeys = 'newType' | 'newTable' | 'frame' | 'deletion';
export type TypeDialogsRef = React.RefObject<DialogRefData<TypeEditorAndDeletionKeys>>;

/**
 * Editor overlay for the Types.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const TypeEditorOverlay = defineEditorOverlay<TypeEditorAndDeletionKeys>('TypeEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'newType':
      return <TypeNewEditor from="type" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'newTable':
      return <TypeNewEditor from="typeTable" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <TypeFrameEditor ref={handleCloseRef} />;
    case 'deletion':
      return <TypeDeletionEditor onClose={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
