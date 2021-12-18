import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoveStatus } from '../../../../../models/entities/move/Move.model';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { MoveDataProps } from '../MoveDataPropsInterface';

const isDisabledStatus = (status: MoveStatus[] | null, index: number) => {
  return status === null || status.length <= index || status[index].status === null ? true : undefined;
};

const isDisabledLuckRate = (status: MoveStatus[] | null, index: number) => {
  return status === null || status.length <= index || status[index].luckRate === 0 ? true : undefined;
};

export const StatusDataBlock = ({ move, onClick }: MoveDataProps) => {
  const { t } = useTranslation(['database_moves']);

  const getStatus = (status: MoveStatus[] | null, index: number) => {
    if (status === null || status.length <= index || status[index].status === null) return t('database_moves:none');
    return t(`database_moves:${status[index].status}` as never);
  };

  const getLuckRate = (status: MoveStatus[] | null, index: number) => {
    if (status === null || status.length <= index || status[index].luckRate === 0) return t('database_moves:none');
    return `${status[index].luckRate} %`;
  };

  return (
    <DataBlockWithTitle size="half" title={t('database_moves:statuses')} onClick={onClick}>
      <DataGrid columns="1fr 1fr 1fr" rows="1fr 1fr">
        <DataFieldsetField
          label={t('database_moves:status_1')}
          data={getStatus(move.moveStatus, 0)}
          disabled={isDisabledStatus(move.moveStatus, 0)}
        />
        <DataFieldsetField
          label={t('database_moves:chance')}
          data={getLuckRate(move.moveStatus, 0)}
          disabled={isDisabledLuckRate(move.moveStatus, 0)}
        />
        <DataFieldsetField
          label={t('database_moves:status_2')}
          data={getStatus(move.moveStatus, 1)}
          disabled={isDisabledStatus(move.moveStatus, 1)}
        />
        <DataFieldsetField
          label={t('database_moves:chance')}
          data={getLuckRate(move.moveStatus, 1)}
          disabled={isDisabledLuckRate(move.moveStatus, 1)}
        />
        <DataFieldsetField
          label={t('database_moves:status_3')}
          data={getStatus(move.moveStatus, 2)}
          disabled={isDisabledStatus(move.moveStatus, 2)}
        />
        <DataFieldsetField
          label={t('database_moves:chance')}
          data={getLuckRate(move.moveStatus, 2)}
          disabled={isDisabledLuckRate(move.moveStatus, 2)}
        />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
