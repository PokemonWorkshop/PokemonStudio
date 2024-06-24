import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import React from 'react';
import { AbilityDeletion } from './AbilityDeletion';
import { AbilityFrameEditor } from './AbilityFrameEditor';
import { AbilityNewEditor } from './AbilityNewEditor';

export type AbilityEditorAndDeletionKeys = 'new' | 'frame' | 'deletion';
export type AbilityDialogsRef = React.RefObject<DialogRefData<AbilityEditorAndDeletionKeys>>;

/**
 * Editor overlay for the abilities.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const AbilityEditorOverlay = defineEditorOverlay<AbilityEditorAndDeletionKeys>(
  'AbilityEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
        return <AbilityNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'frame':
        return <AbilityFrameEditor ref={handleCloseRef} />;
      case 'deletion':
        return <AbilityDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
