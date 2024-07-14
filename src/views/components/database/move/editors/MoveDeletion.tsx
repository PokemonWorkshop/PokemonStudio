import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMoves } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MoveDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the move before doing so.
 */
export const MoveDeletion = forwardRef<EditorHandlingClose, MoveDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_moves');
  const { projectDataValues: moves, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteMove, state } = useProjectMoves();
  const move = moves[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveName = useMemo(() => getEntityNameText(move, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(moves)
      .map(([value, moveData]) => ({ value, index: moveData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    deleteMove(dbSymbol, { move: firstDbSymbol });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { move: moveName })}
      message={t('deletion_message', { move: moveName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
MoveDeletion.displayName = 'MoveDeletion';
