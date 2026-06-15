import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { TrainerPartyOverflowWarning } from './TrainerPartyOverflowWarning';

export type TrainerPartyOverflowKeys = 'overflow_warning';
export type TrainerPartyOverflowDialogsRef = React.RefObject<DialogRefData<TrainerPartyOverflowKeys> | null>;

type Props = {
  onConfirm: () => void;
  threshold: number;
};

export const TrainerPartyOverflowOverlay = defineEditorOverlay<TrainerPartyOverflowKeys, Props>(
  'TrainerPartyOverflowOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onConfirm, threshold }) => {
    switch (dialogToShow) {
      case 'overflow_warning':
        return <TrainerPartyOverflowWarning ref={handleCloseRef} closeDialog={closeDialog} onConfirm={onConfirm} threshold={threshold} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  },
);
