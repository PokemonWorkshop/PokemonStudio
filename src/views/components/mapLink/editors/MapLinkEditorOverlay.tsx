import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { MapLinkAddMapEditor, MapLinkDeletion } from '.';
import type { StudioMapLinkCardinal } from '@src/models/entities/mapLink';

export type MapLinkEditorAndDeletionKeys = 'add_map' | 'deletion';
export type MapLinkDialogsRef = React.RefObject<DialogRefData<MapLinkEditorAndDeletionKeys>>;

/**
 * Editor overlay for the mapLinks.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const MapLinkEditorOverlay = defineEditorOverlay<
  MapLinkEditorAndDeletionKeys,
  {
    cardinal: StudioMapLinkCardinal;
  }
>('MapLinkEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'add_map':
      return <MapLinkAddMapEditor closeDialog={closeDialog} cardinal={props.cardinal} ref={handleCloseRef} />;
    case 'deletion':
      return <MapLinkDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
