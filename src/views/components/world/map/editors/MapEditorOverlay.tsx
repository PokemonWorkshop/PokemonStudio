import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { MapFrameEditor } from './MapFrameEditor';
import { MapDeletion } from './MapDeletion';
import { MapMusicsEditor } from './MapMusicsEditor';
import { MapNewEditor } from './MapNewEditor';
import { MapFolderDeletion } from './MapFolderDeletion';
import { StudioMapInfoFolder, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { MapOpenTiledError } from './MapOpenTiledError';

export type MapEditorAndDeletionKeys = 'new' | 'frame' | 'musics' | 'deletion' | 'deletion_folder' | 'open_tiled_error';
export type MapDialogsRef = React.RefObject<DialogRefData<MapEditorAndDeletionKeys>>;

type Props = {
  mapInfoValue?: StudioMapInfoValue;
};

/**
 * Editor overlay for the maps.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const MapEditorOverlay = defineEditorOverlay<MapEditorAndDeletionKeys, Props>(
  'MapEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { mapInfoValue }) => {
    switch (dialogToShow) {
      case 'new':
        return <MapNewEditor ref={handleCloseRef} closeDialog={closeDialog} mapInfoParent={mapInfoValue} />;
      case 'frame':
        return <MapFrameEditor ref={handleCloseRef} closeDialog={closeDialog} />;
      case 'musics':
        return <MapMusicsEditor ref={handleCloseRef} />;
      case 'deletion':
        return (
          <MapDeletion
            closeDialog={closeDialog}
            ref={handleCloseRef}
            dbSymbol={mapInfoValue?.data.klass === 'MapInfoMap' ? mapInfoValue.data.mapDbSymbol : undefined}
          />
        );
      case 'deletion_folder':
        return <MapFolderDeletion closeDialog={closeDialog} ref={handleCloseRef} mapInfoFolder={mapInfoValue as StudioMapInfoFolder} />;
      case 'open_tiled_error':
        return <MapOpenTiledError closeDialog={closeDialog} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
