import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { DexNewEditor, DexDeletion, DexFrameEditor, DexPokemonListAddEditor, DexPokemonListEditEditor, DexPokemonListImportEditor } from '.';
import { DexResetNationalPopUp } from '../DexResetNationalPopUp';

export type DexEditorAndDeletionKeys = 'new' | 'frame' | 'add_pokemon' | 'edit' | 'import' | 'deletion_dex' | 'deletion_list' | 'reset';
export type DexDialogsRef = React.RefObject<DialogRefData<DexEditorAndDeletionKeys>>;

/**
 * Editor overlay for the dex.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const DexEditorOverlay = defineEditorOverlay<
  DexEditorAndDeletionKeys,
  {
    creatureIndex: number;
  }
>('DexEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, { creatureIndex }) => {
  switch (dialogToShow) {
    case 'new':
      return <DexNewEditor onClose={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <DexFrameEditor ref={handleCloseRef} />;
    case 'add_pokemon':
      return <DexPokemonListAddEditor onClose={closeDialog} ref={handleCloseRef} />;
    case 'edit':
      return <DexPokemonListEditEditor ref={handleCloseRef} creatureIndex={creatureIndex} />;
    case 'import':
      return <DexPokemonListImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'deletion_dex':
      return <DexDeletion onClose={closeDialog} ref={handleCloseRef} type="dex" />;
    case 'deletion_list':
      return <DexDeletion onClose={closeDialog} ref={handleCloseRef} type="list" />;
    case 'reset':
      return <DexResetNationalPopUp onClose={closeDialog} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
