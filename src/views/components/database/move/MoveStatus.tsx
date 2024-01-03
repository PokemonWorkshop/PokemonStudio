import React from 'react';
import { StudioMove, StudioMoveStatus, StudioMoveStatusList } from '@modelEntities/move';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

const isDisabledStatus = (status: StudioMoveStatus[] | null, index: number) => {
  return status === null || status.length <= index || status[index].status === null ? true : undefined;
};

const isDisabledLuckRate = (status: StudioMoveStatus[] | null, index: number) => {
  return status === null || status.length <= index || status[index].luckRate === 0 ? true : undefined;
};

type MoveStatusProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveStatus = ({ move, dialogsRef }: MoveStatusProps) => {
  const { t } = useTranslation('database_moves');

  const getStatus = (status: StudioMoveStatus[] | null, index: number) => {
    if (status === null || status.length <= index || status[index].status === null) return t('none');
    return t(`${status[index].status}` as Exclude<StudioMoveStatusList, null>);
  };

  const getLuckRate = (status: StudioMoveStatus[] | null, index: number) => {
    if (status === null || status.length <= index || status[index].luckRate === 0) return t('none');
    return `${status[index].luckRate} %`;
  };

  const shouldDisplayLuckRate = (status: StudioMoveStatus[] | null) => {
    return status !== null && status.length > 1;
  };

  return (
    <DataBlockWithTitle size="half" title={t('statuses')} onClick={() => dialogsRef?.current?.openDialog('status')}>
      <DataGrid columns="1fr 1fr 1fr" rows="1fr 1fr">
        {move.moveStatus.map((status, index) => (
          <React.Fragment key={index}>
            <DataFieldsetField
              label={t(`status_${index + 1}`)}
              data={getStatus(move.moveStatus, index)}
              disabled={isDisabledStatus(move.moveStatus, index)}
            />
            {shouldDisplayLuckRate(move.moveStatus) && (
              <DataFieldsetField
                label={t('chance')}
                data={getLuckRate(move.moveStatus, index)}
                disabled={isDisabledLuckRate(move.moveStatus, index)}
              />
            )}
          </React.Fragment>
        ))}
      </DataGrid>
    </DataBlockWithTitle>
  );
};
