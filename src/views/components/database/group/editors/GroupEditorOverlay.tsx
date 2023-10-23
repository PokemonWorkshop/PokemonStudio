import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { GroupFrameEditor, GroupNewEditor } from '.';
import { GroupDeletion } from './GroupDeletion';

export type GroupEditorAndDeletionKeys = 'new' | 'frame' | 'deletion';
export type GroupDialogsRef = React.RefObject<DialogRefData<GroupEditorAndDeletionKeys>>;

/**
 * Editor overlay for the groups.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const GroupEditorOverlay = defineEditorOverlay<GroupEditorAndDeletionKeys>(
  'GroupEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
        return <GroupNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'frame':
        return <GroupFrameEditor ref={handleCloseRef} />;
      case 'deletion':
        return <GroupDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
