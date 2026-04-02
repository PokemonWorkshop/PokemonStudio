import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import type { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import { PokemonBattlerChangeOrder, PokemonBattlerDeletion, PokemonBattlerEditor, PokemonBattlerImport } from '.';

export type PokemonBattlerEditorAndDeletionKeys = 'new' | 'edit' | 'import' | 'change_order' | 'deletion';
export type PokemonBattlerDialogsRef = React.RefObject<DialogRefData<PokemonBattlerEditorAndDeletionKeys> | null>;
export type PokemonBattlerFrom = 'trainer' | 'group' | 'quest_earning';
export type PokemonPropertyType = 'default' | 'evs' | 'moves';
export type CurrentBattlerType = {
  index: number;
  kind: undefined | PokemonPropertyType;
};
type PokemonBattlerEditorOverlayProps = {
  currentBattler: CurrentBattlerType;
  from: Exclude<PokemonBattlerFrom, 'quest_earning'>;
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
      case 'change_order':
        if (window.api.isDev && from === 'group') console.warn('This feature is only available for the trainer');
        return <PokemonBattlerChangeOrder closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'deletion':
        return <PokemonBattlerDeletion closeDialog={closeDialog} ref={handleCloseRef} index={currentBattler.index} from={from} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
