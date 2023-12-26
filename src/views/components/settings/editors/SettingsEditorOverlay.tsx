import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { SettingsMapsUseTiledMessageBox } from './SettingsMapsUseTiledMessageBox';

export type SettingsEditorAndDeletionKeys = 'use_tiled_message_box';
export type SettingsDialogsRef = React.RefObject<DialogRefData<SettingsEditorAndDeletionKeys>>;

/**
 * Editor overlay for the Studio settings.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const SettingsEditorOverlay = defineEditorOverlay<SettingsEditorAndDeletionKeys>(
  'SettingsEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'use_tiled_message_box':
        return <SettingsMapsUseTiledMessageBox closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
