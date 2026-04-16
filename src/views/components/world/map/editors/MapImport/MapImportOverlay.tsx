import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { MapImport } from './MapImport';

export type MapImportEditorTitle = 'import';
export type MapImportDialogsRef = React.RefObject<DialogRefData<MapImportEditorTitle> | null>;

type MapImportOverlayProps = {
  closeParentDialog: () => void;
};

/**
 * Editor overlay for the import of the maps
 */
export const MapImportOverlay = defineEditorOverlay<MapImportEditorTitle, MapImportOverlayProps>(
  'MapTranslationOverlay',
  (dialogToShow, _, closeDialog, { closeParentDialog }) => {
    switch (dialogToShow) {
      case 'import':
        return (
          <>
            <MapImport closeDialog={closeDialog} closeParentDialog={closeParentDialog} />
            <div id="map-import-tooltip" />
          </>
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
