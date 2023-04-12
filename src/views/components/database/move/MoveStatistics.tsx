import React from 'react';
import { getBattleStageModModificator, StudioMove, StudioMoveBattleStage } from '@modelEntities/move';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldgroup, DataFieldgroupField, DataGrid } from '../dataBlocks';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveStatisticsProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveStatistics = ({ move, dialogsRef }: MoveStatisticsProps) => {
  const { t } = useTranslation('database_moves');

  const getStatistic = (stageType: StudioMoveBattleStage) => {
    const modificator = getBattleStageModModificator(move, stageType);
    if (modificator > 0) return `+${modificator}`;
    return modificator;
  };

  return (
    <DataBlockWithTitle size="half" title={t('statistics_modification')} onClick={() => dialogsRef?.current?.openDialog('statistics')}>
      <DataGrid columns="1fr 1fr" gap="64px">
        <DataFieldgroup title="">
          <DataFieldgroupField label={t('attack')} data={getStatistic('ATK_STAGE')} />
          <DataFieldgroupField label={t('defense')} data={getStatistic('DFE_STAGE')} />
          <DataFieldgroupField label={t('special_attack')} data={getStatistic('ATS_STAGE')} />
          <DataFieldgroupField label={t('special_defense')} data={getStatistic('DFS_STAGE')} />
          <DataFieldgroupField label={t('speed')} data={getStatistic('SPD_STAGE')} />
        </DataFieldgroup>
        <DataFieldgroup title="">
          <DataFieldgroupField label={t('evasion')} data={getStatistic('EVA_STAGE')} />
          <DataFieldgroupField label={t('accuracy')} data={getStatistic('ACC_STAGE')} />
        </DataFieldgroup>
      </DataGrid>
    </DataBlockWithTitle>
  );
};
