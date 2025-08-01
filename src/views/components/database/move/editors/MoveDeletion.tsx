import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMoves } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateMove } from './useUpdateMove';

type MoveDeletionProps = {
  type: 'move' | 'combo_moves';
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the move before doing so.
 */
export const MoveDeletion = forwardRef<EditorHandlingClose, MoveDeletionProps>(({ type, closeDialog }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: moves, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteMove, state } = useProjectMoves();
  const move = moves[dbSymbol];
  const updateMove = useUpdateMove(move);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveName = useMemo(() => getEntityNameText(move, state), []);

  const onClickDelete = () => {
    if (type === 'move') {
      const firstDbSymbol = Object.entries(moves)
        .map(([value, moveData]) => ({ value, index: moveData.id }))
        .filter((d) => d.value !== dbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      deleteMove(dbSymbol, { move: firstDbSymbol });
    } else if (type === 'combo_moves') {
      updateMove({ comboMoves: [] });
    }
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={type === 'move' ? t('deletion_of_move', { move: moveName }) : t('deletion_of_combo_moves', { move: moveName })}
      message={type === 'move' ? t('deletion_message_move', { move: moveName }) : t('deletion_message_combo_moves', { move: moveName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
MoveDeletion.displayName = 'MoveDeletion';
