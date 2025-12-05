import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldsetField } from '../dataBlocks';
import { StudioMove } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveDataContestProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveDataContest = ({ move, dialogsRef }: MoveDataContestProps) => {
  const { t } = useTranslation();

  return (
    <DataBlockWithTitle size="half" title={t('data')} onClick={() => dialogsRef?.current?.openDialog('data_contest')}>
      <DataGrid columns="1fr 1fr 1fr" rows="1fr 1fr">
        <DataFieldsetField label={t('appeal')} data={move.appeal} />
        <DataFieldsetField label={t('jam')} data={move.jam} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
