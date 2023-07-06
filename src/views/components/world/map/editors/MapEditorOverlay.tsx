import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { MapFrameEditor } from './MapFrameEditor';
import { MapDeletion } from './MapDeletion';
import { MapMusicsEditor } from './MapMusicsEditor';
import { MapNewEditor } from './MapNewEditor';

export type MapEditorAndDeletionKeys = 'new' | 'frame' | 'musics' | 'deletion';
export type MapDialogsRef = React.RefObject<DialogRefData<MapEditorAndDeletionKeys>>;

/**
 * Editor overlay for the maps.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const MapEditorOverlay = defineEditorOverlay<MapEditorAndDeletionKeys>('MapEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'new':
      return <MapNewEditor ref={handleCloseRef} closeDialog={closeDialog} />;
    case 'frame':
      return <MapFrameEditor ref={handleCloseRef} />;
    case 'musics':
      return <MapMusicsEditor ref={handleCloseRef} />;
    case 'deletion':
      return <MapDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
