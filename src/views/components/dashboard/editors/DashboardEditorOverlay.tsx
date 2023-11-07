import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { DashboardStudioModeModal } from './DashboardStudioModeModal';

export type DashboardEditorAndDeletionKeys = 'studio_mode_modal';
export type DashboardDialogsRef = React.RefObject<DialogRefData<DashboardEditorAndDeletionKeys>>;

/**
 * Editor overlay for the dashboard.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const DashboardEditorOverlay = defineEditorOverlay<DashboardEditorAndDeletionKeys>(
  'DashboardEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'studio_mode_modal':
        return <DashboardStudioModeModal closeDialog={closeDialog} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
