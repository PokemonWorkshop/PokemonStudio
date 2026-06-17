import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { CreateMysteryGiftEditor } from './CreateMysteryGiftEditor';
import type { GiftDetailed } from './GiftDetailsView';

export type MysteryGiftEditorKeys = 'create' | 'edit';
export type MysteryGiftDialogsRef = React.RefObject<DialogRefData<MysteryGiftEditorKeys> | null>;

type Props = {
  onCreated: () => void;
  /** Set by the page before opening the 'edit' dialog. The editor pre-fills from this. */
  editingGift?: GiftDetailed;
};

export const MysteryGiftEditorOverlay = defineEditorOverlay<MysteryGiftEditorKeys, Props>(
  'MysteryGiftEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onCreated, editingGift }) => {
    switch (dialogToShow) {
      case 'create':
        return <CreateMysteryGiftEditor ref={handleCloseRef} closeDialog={closeDialog} onCreated={onCreated} />;
      case 'edit':
        return (
          <CreateMysteryGiftEditor
            ref={handleCloseRef}
            closeDialog={closeDialog}
            onCreated={onCreated}
            editingGift={editingGift}
          />
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
