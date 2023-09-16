import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import type { DialogRefData } from '@utils/useDialogsRef';
import { PokemonBattlerDeletion, PokemonBattlerEditor, PokemonBattlerImport } from '.';

export type PokemonBattlerEditorAndDeletionKeys = 'new' | 'edit' | 'import' | 'deletion';
export type PokemonBattlerDialogsRef = React.RefObject<DialogRefData<PokemonBattlerEditorAndDeletionKeys>>;
export type PokemonBattlerFrom = 'trainer' | 'group';
export type PokemonPropertyType = 'default' | 'evs' | 'moves';
export type CurrentBattlerType = {
  index: number;
  kind: undefined | PokemonPropertyType;
};
type PokemonBattlerEditorOverlayProps = {
  currentBattler: CurrentBattlerType;
  from: PokemonBattlerFrom;
};

/**
 * Editor overlay for the Pokemon battler.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const PokemonBattlerEditorOverlay = defineEditorOverlay<PokemonBattlerEditorAndDeletionKeys, PokemonBattlerEditorOverlayProps>(
  'PokemonBattlerEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { currentBattler, from }) => {
    switch (dialogToShow) {
      case 'new':
        return (
          <PokemonBattlerEditor
            action="creation"
            closeDialog={closeDialog}
            ref={handleCloseRef}
            currentBattler={{ ...currentBattler, kind: undefined }}
            from={from}
          />
        );
      case 'edit':
        return <PokemonBattlerEditor action="edit" closeDialog={closeDialog} ref={handleCloseRef} currentBattler={currentBattler} from={from} />;
      case 'import':
        return <PokemonBattlerImport closeDialog={closeDialog} ref={handleCloseRef} from={from} />;
      case 'deletion':
        return <PokemonBattlerDeletion closeDialog={closeDialog} ref={handleCloseRef} index={currentBattler.index} from={from} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
