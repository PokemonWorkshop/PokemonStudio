import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
//import { NatureChangingStatsEditor, NatureDeletion, NatureFlavorsEditor, NatureFrameEditor, NatureNewEditor } from '.';

export type NatureEditorAndDeletionKeys = 'new' | 'frame' | 'stats' | 'flavors' | 'deletion';
export type NatureDialogsRef = React.RefObject<DialogRefData<NatureEditorAndDeletionKeys>>;

/**
 * Editor overlay for the natures.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const NatureEditorOverlay = defineEditorOverlay<NatureEditorAndDeletionKeys>(
  'NatureEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
      case 'frame':
      case 'stats':
      case 'flavors':
      case 'deletion':
        return <div />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
