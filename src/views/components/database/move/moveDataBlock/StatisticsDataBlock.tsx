import { getBattleStageModModificator, StudioMoveBattleStage } from '@modelEntities/move';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldgroup, DataFieldgroupField, DataGrid } from '../../dataBlocks';
import { MoveDataProps } from '../MoveDataPropsInterface';

export const StatisticsDataBlock = ({ move, onClick }: MoveDataProps) => {
  const { t } = useTranslation(['database_moves']);

  const getStatistic = (stageType: StudioMoveBattleStage) => {
    const modificator = getBattleStageModModificator(move, stageType);
    if (modificator > 0) return `+${modificator}`;
    return modificator;
  };

  return (
    <DataBlockWithTitle size="half" title={t('database_moves:statistics_modification')} onClick={onClick}>
      <DataGrid columns="1fr 1fr" gap="64px">
        <DataFieldgroup title="">
          <DataFieldgroupField label={t('database_moves:attack')} data={getStatistic('ATK_STAGE')} />
          <DataFieldgroupField label={t('database_moves:defense')} data={getStatistic('DFE_STAGE')} />
          <DataFieldgroupField label={t('database_moves:special_attack')} data={getStatistic('ATS_STAGE')} />
          <DataFieldgroupField label={t('database_moves:special_defense')} data={getStatistic('DFS_STAGE')} />
          <DataFieldgroupField label={t('database_moves:speed')} data={getStatistic('SPD_STAGE')} />
        </DataFieldgroup>
        <DataFieldgroup title="">
          <DataFieldgroupField label={t('database_moves:evasion')} data={getStatistic('EVA_STAGE')} />
          <DataFieldgroupField label={t('database_moves:accuracy')} data={getStatistic('ACC_STAGE')} />
        </DataFieldgroup>
      </DataGrid>
    </DataBlockWithTitle>
  );
};
