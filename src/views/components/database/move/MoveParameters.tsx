import React from 'react';
import { DataFieldsetFieldCode } from '@components/database/dataBlocks/DataFieldsetField';
import { MOVE_BATTLE_ENGINE_METHODS, MoveBattleEngineMethodsType, StudioMove } from '@modelEntities/move';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveParametersProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveParameters = ({ move, dialogsRef }: MoveParametersProps) => {
  const { t } = useTranslation('database_moves');

  const getCategory = () => {
    if (!(MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(move.battleEngineMethod)) return t('custom');
    return t(`${move.battleEngineMethod}` as MoveBattleEngineMethodsType);
  };

  return (
    <DataBlockWithTitle size="half" title={t('settings')} onClick={() => dialogsRef?.current?.openDialog('parameters')}>
      <DataGrid columns="1fr" rows="42px 42px 1fr">
        <DataFieldsetField label={t('target')} data={t(move.battleEngineAimedTarget)} />
        <DataFieldsetField label={t('procedure')} data={getCategory()} />
        <DataFieldsetFieldCode label={t('function')} data={move.battleEngineMethod || '__undef__'} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
