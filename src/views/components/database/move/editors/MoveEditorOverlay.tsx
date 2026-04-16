import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { DialogRefData } from '@hooks/useDialogsRef';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';
import {
  MoveCharacteristicsEditor,
  MoveComboMovesImportEditor,
  MoveContestEffectsEditor,
  MoveDataContestEditor,
  MoveDataEditor,
  MoveDeletion,
  MoveFrameContestEditor,
  MoveFrameEditor,
  MoveNewEditor,
  MoveParametersEditor,
  MoveStatisticsEditor,
  MoveStatusEditor,
} from '.';
import { MoveComboNewEditor } from './MoveComboNewEditor';

export type MoveEditorAndDeletionKeys =
  | 'new'
  | 'frame'
  | 'characteristics'
  | 'data'
  | 'parameters'
  | 'statistics'
  | 'status'
  | 'frame_contest'
  | 'data_contest'
  | 'contest_effects'
  | 'combo_moves_new'
  | 'combo_moves_import'
  | 'deletion'
  | 'combo_move_deletion';
export type MoveDialogsRef = React.RefObject<DialogRefData<MoveEditorAndDeletionKeys> | null>;

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
      return <MoveDeletion type="move" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'combo_move_deletion':
      return <MoveDeletion type="combo_moves" closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'frame_contest':
      return <MoveFrameContestEditor ref={handleCloseRef} />;
    case 'data_contest':
      return <MoveDataContestEditor ref={handleCloseRef} />;
    case 'combo_moves_import':
      return <MoveComboMovesImportEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'combo_moves_new':
      return <MoveComboNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'contest_effects':
      return <MoveContestEffectsEditor ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
