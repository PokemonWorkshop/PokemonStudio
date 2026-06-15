import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { CreateMysteryGiftEditor } from './CreateMysteryGiftEditor';

export type MysteryGiftEditorKeys = 'create';
export type MysteryGiftDialogsRef = React.RefObject<DialogRefData<MysteryGiftEditorKeys> | null>;

type Props = {
  onCreated: () => void;
};

export const MysteryGiftEditorOverlay = defineEditorOverlay<MysteryGiftEditorKeys, Props>(
  'MysteryGiftEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onCreated }) => {
    switch (dialogToShow) {
      case 'create':
        return <CreateMysteryGiftEditor ref={handleCloseRef} closeDialog={closeDialog} onCreated={onCreated} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
