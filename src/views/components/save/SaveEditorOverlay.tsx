import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { MapModificationWarningDialog } from './MapModificationWarningDialog';

export type SaveEditorAndDeletionKeys = 'map_warning';
export type SaveDialogsRef = React.RefObject<DialogRefData<SaveEditorAndDeletionKeys>>;

/**
 * Editor overlay for the save.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const SaveEditorOverlay = defineEditorOverlay<SaveEditorAndDeletionKeys>('SaveEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'map_warning':
      return <MapModificationWarningDialog closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
