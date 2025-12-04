import { DataBlockEditor } from '@components/editor';
import { useProjectMoves } from '@hooks/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StudioMove } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';
import { MoveContestCombosTable } from './moveTable/MoveContestCombosTable';

type MoveContestCombosProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveContestCombos = ({ move, dialogsRef }: MoveContestCombosProps) => {
  const { projectDataValues: moves } = useProjectMoves();
  const { t } = useTranslation();

  return (
    <DataBlockEditor
      size="full"
      title={t('contest_combo_moves')}
      onClickDelete={() => dialogsRef.current?.openDialog('combo_move_deletion', true)}
      importation={{ label: t('import_combo_moves'), onClick: () => dialogsRef.current?.openDialog('combo_moves_import') }}
      add={{ label: t('add_combo_moves'), onClick: () => dialogsRef.current?.openDialog('combo_moves_new') }}
      disabledDeletion={move.comboMoves.length === 0}
      disabledImport={Object.keys(moves).length <= 1}
    >
      <MoveContestCombosTable move={move} />
    </DataBlockEditor>
  );
};
