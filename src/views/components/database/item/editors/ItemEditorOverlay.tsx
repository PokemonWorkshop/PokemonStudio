import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import {
  ItemNewEditor,
  ItemFrameEditor,
  ItemGenericDataEditor,
  ItemParametersDataEditor,
  ItemTechDataEditor,
  ItemExplorationDataEditor,
  ItemBattleDataEditor,
  ItemCatchDataEditor,
  ItemHealDataEditor,
  ItemProgressDataEditor,
  ItemBerriesDataEditor,
  ItemCookingDataEditor,
  ItemDeletion,
} from '.';

export type ItemEditorAndDeletionKeys =
  | 'newItem'
  | 'newTable'
  | 'frame'
  | 'generic'
  | 'parameters'
  | 'tech'
  | 'exploration'
  | 'battle'
  | 'catch'
  | 'progress'
  | 'heal'
  | 'berries'
  | 'cooking'
  | 'deletion';
export type ItemDialogsRef = React.RefObject<DialogRefData<ItemEditorAndDeletionKeys>>;

/**
 * Editor overlay for the Items.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const ItemEditorOverlay = defineEditorOverlay<ItemEditorAndDeletionKeys>('ItemEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'newItem':
      return <ItemNewEditor from={'items'} closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'newTable':
      return <ItemNewEditor from={'techItemsTable'} closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <ItemFrameEditor ref={handleCloseRef} />;
    case 'generic':
      return <ItemGenericDataEditor ref={handleCloseRef} />;
    case 'parameters':
      return <ItemParametersDataEditor ref={handleCloseRef} />;
    case 'tech':
      return <ItemTechDataEditor ref={handleCloseRef} />;
    case 'exploration':
      return <ItemExplorationDataEditor ref={handleCloseRef} />;
    case 'battle':
      return <ItemBattleDataEditor ref={handleCloseRef} />;
    case 'catch':
      return <ItemCatchDataEditor ref={handleCloseRef} />;
    case 'progress':
      return <ItemProgressDataEditor ref={handleCloseRef} />;
    case 'heal':
      return <ItemHealDataEditor ref={handleCloseRef} />;
    case 'berries':
      return <ItemBerriesDataEditor ref={handleCloseRef} />;
    case 'cooking':
      return <ItemCookingDataEditor ref={handleCloseRef} />;
    case 'deletion':
      return <ItemDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
