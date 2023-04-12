import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import {
  MoveCharacteristicsEditor,
  MoveDataEditor,
  MoveDeletion,
  MoveFrameEditor,
  MoveNewEditor,
  MoveParametersEditor,
  MoveStatisticsEditor,
  MoveStatusEditor,
} from '.';

export type MoveEditorAndDeletionKeys = 'new' | 'frame' | 'characteristics' | 'data' | 'parameters' | 'statistics' | 'status' | 'deletion';
export type MoveDialogsRef = React.RefObject<DialogRefData<MoveEditorAndDeletionKeys>>;

/**
 * Editor overlay for the moves.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const MoveEditorOverlay = defineEditorOverlay<MoveEditorAndDeletionKeys>('MoveEditorOverlay', (dialogToShow, handleCloseRef, closeDialog) => {
  switch (dialogToShow) {
    case 'new':
      return <MoveNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame':
      return <MoveFrameEditor ref={handleCloseRef} />;
    case 'characteristics':
      return <MoveCharacteristicsEditor ref={handleCloseRef} />;
    case 'data':
      return <MoveDataEditor ref={handleCloseRef} />;
    case 'parameters':
      return <MoveParametersEditor ref={handleCloseRef} />;
    case 'statistics':
      return <MoveStatisticsEditor ref={handleCloseRef} />;
    case 'status':
      return <MoveStatusEditor ref={handleCloseRef} />;
    case 'deletion':
      return <MoveDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
