import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { NatureDeletion, NatureFlavorsEditor, NatureFrameEditor, NatureNewEditor, NatureStatsEditor } from '.';

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
        return <NatureNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'frame':
        return <NatureFrameEditor ref={handleCloseRef} />;
      case 'stats':
        return <NatureStatsEditor ref={handleCloseRef} />;
      case 'flavors':
        return <NatureFlavorsEditor ref={handleCloseRef} />;
      case 'deletion':
        return <NatureDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
