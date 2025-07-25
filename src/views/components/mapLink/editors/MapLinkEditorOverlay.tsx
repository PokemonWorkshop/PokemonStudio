import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { NewLinkEditor } from '.';

export type MapLinkEditorAndDeletionKeys = 'new' | 'new_link';
export type MapLinkDialogsRef = React.RefObject<DialogRefData<MapLinkEditorAndDeletionKeys>>;

/**
 * Editor overlay for the mapLinks.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const MapLinkEditorOverlay = defineEditorOverlay<MapLinkEditorAndDeletionKeys>(
  'MapLinkEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog) => {
    switch (dialogToShow) {
      case 'new':
        return <div />;
      case 'new_link':
        return <div />;
      //return <NewLinkEditor />; //TODO:
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
