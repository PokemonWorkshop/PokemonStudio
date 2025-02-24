import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import {
  ZoneNewEditor,
  ZoneFrameEditor,
  ZoneSettingsEditor,
  ZoneTravelEditor,
  ZoneAddGroupEditor,
  ZoneEditGroupEditor,
  ZoneGroupImportEditor,
} from '.';

export type ZoneEditorAndDeletionKeys = 'new' | 'frame' | 'settings' | 'travel' | 'addGroup' | 'editGroup' | 'importGroup';
export type ZoneDialogsRef = React.RefObject<DialogRefData<ZoneEditorAndDeletionKeys>>;

/**
 * Editor overlay for the zones.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const ZoneEditorOverlay = defineEditorOverlay<ZoneEditorAndDeletionKeys>('ZoneEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'new':
      return <ZoneNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <ZoneFrameEditor ref={handleCloseRef} />;
    case 'settings':
      return <ZoneSettingsEditor ref={handleCloseRef} />;
    case 'travel':
      return <ZoneTravelEditor ref={handleCloseRef} />;
    case 'addGroup':
      return <ZoneAddGroupEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'editGroup':
      return <ZoneEditGroupEditor ref={handleCloseRef} />;
    case 'importGroup':
      return <ZoneGroupImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      assertUnreachable(dialogToShow);
  }
});
