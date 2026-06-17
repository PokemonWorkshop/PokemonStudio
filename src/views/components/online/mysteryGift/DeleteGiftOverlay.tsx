import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { DeleteGiftConfirmation } from './DeleteGiftConfirmation';

export type DeleteGiftKeys = 'confirm';
export type DeleteGiftDialogsRef = React.RefObject<DialogRefData<DeleteGiftKeys> | null>;

type Props = {
  title: string;
  onConfirm: () => void;
};

export const DeleteGiftOverlay = defineEditorOverlay<DeleteGiftKeys, Props>(
  'DeleteGiftOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { title, onConfirm }) => {
    switch (dialogToShow) {
      case 'confirm':
        return <DeleteGiftConfirmation ref={handleCloseRef} closeDialog={closeDialog} onConfirm={onConfirm} title={title} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
