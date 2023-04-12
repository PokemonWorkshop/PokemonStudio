import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldsetField } from '../dataBlocks';
import { StudioMove, StudioMoveCriticalRate, TEXT_CRITICAL_RATES } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

type MoveDataProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveData = ({ move, dialogsRef }: MoveDataProps) => {
  const { t } = useTranslation('database_moves');

  const getTextCriticalRate = () => {
    if (move.movecriticalRate > 3) return t(TEXT_CRITICAL_RATES[4]);
    return t(TEXT_CRITICAL_RATES[move.movecriticalRate as Exclude<StudioMoveCriticalRate, 4 | 5>]);
  };

  const getPriority = () => {
    if (move.priority > 0) return `+${move.priority}`;
    return move.priority;
  };

  return (
    <DataBlockWithTitle size="half" title={t('data')} onClick={() => dialogsRef?.current?.openDialog('data')}>
      <DataGrid columns="1fr 1fr 1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField label={t('power')} data={move.power} />
        <DataFieldsetField label={t('accuracy')} data={move.accuracy} />
        <DataFieldsetField label={t('pp')} data={move.pp} />
        <DataFieldsetField label={t('critical_rate')} data={getTextCriticalRate()} />
        <DataFieldsetField label={t('effect_chance')} data={move.effectChance === 0 ? t('always') : `${move.effectChance} %`} />
        <DataFieldsetField label={t('priority')} data={getPriority()} />
        <DataFieldsetField label={t('common_event')} data={move.mapUse || t('none')} disabled={move.mapUse === 0} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
