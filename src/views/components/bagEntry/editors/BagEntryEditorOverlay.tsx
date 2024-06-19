import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import type { DialogRefData } from '@hooks/useDialogsRef';
import { BagEntryEditor, BagEntryImport } from '.';

export type BagEntryAction = 'edit' | 'creation';
export type BagEntryEditorAndDeletionKeys = 'new' | 'edit' | 'import';
export type BagEntryDialogsRef = React.RefObject<DialogRefData<BagEntryEditorAndDeletionKeys>>;
export type BagEntryFrom = 'trainer';
type BagEntryEditorOverlayProps = {
  index: number;
  from: BagEntryFrom;
};

/**
 * Editor overlay for the bag.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const BagEntryEditorOverlay = defineEditorOverlay<BagEntryEditorAndDeletionKeys, BagEntryEditorOverlayProps>(
  'BagEntryEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { index, from }) => {
    switch (dialogToShow) {
      case 'new':
        return <BagEntryEditor action="creation" closeDialog={closeDialog} ref={handleCloseRef} index={index} from={from} />;
      case 'edit':
        return <BagEntryEditor action="edit" closeDialog={closeDialog} ref={handleCloseRef} index={index} from={from} />;
      case 'import':
        return <BagEntryImport closeDialog={closeDialog} ref={handleCloseRef} from={from} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
