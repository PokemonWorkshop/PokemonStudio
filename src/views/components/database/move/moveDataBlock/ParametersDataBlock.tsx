import { DataFieldsetFieldCode } from '@components/database/dataBlocks/DataFieldsetField';
import { MOVE_BATTLE_ENGINE_METHODS } from '@modelEntities/move';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { MoveDataProps } from '../MoveDataPropsInterface';

export const ParametersDataBlock = ({ move, onClick }: MoveDataProps) => {
  const { t } = useTranslation(['database_moves']);

  const getCategory = () => {
    if (!(MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(move.battleEngineMethod)) return t('database_moves:custom');
    return t(`database_moves:${move.battleEngineMethod}` as never);
  };

  return (
    <DataBlockWithTitle size="half" title={t('database_moves:settings')} onClick={onClick}>
      <DataGrid columns="1fr" rows="42px 42px 1fr">
        <DataFieldsetField label={t('database_moves:target')} data={t(`database_moves:${move.battleEngineAimedTarget}` as never)} />
        <DataFieldsetField label={t('database_moves:procedure')} data={getCategory()} />
        <DataFieldsetFieldCode label={t('database_moves:function')} data={move.battleEngineMethod || '__undef__'} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
