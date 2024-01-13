import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StudioMove, StudioMoveStatus, StudioMoveStatusList } from '@modelEntities/move';
import { DataBlockWithTitle, DataFieldsetField, DataFieldsetFieldWithChild, DataGrid } from '../dataBlocks';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalRegular}

  & span:nth-child(2) {
    color: ${({ theme }) => theme.colors.text400};
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    flex-direction: column;
    gap: 0px;
  }
`;

type MoveStatusProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

const isDisabledStatus = (status: StudioMoveStatus[] | null, index: number) => {
  return status === null || status.length <= index || status[index].status === null ? true : undefined;
};

const STATUS_KEY = ['status_1', 'status_2', 'status_3'] as const;

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
      <DataGrid columns="1fr 1fr 1fr" rows="1fr">
        {move.moveStatus.length === 0 ? (
          <DataFieldsetField label={t(STATUS_KEY[0])} data={getStatus(move.moveStatus, 0)} disabled={isDisabledStatus(move.moveStatus, 0)} />
        ) : (
          move.moveStatus.map((_, index) => (
            <React.Fragment key={index}>
              <DataFieldsetFieldWithChild label={t(STATUS_KEY[index])}>
                <StatusContainer>
                  <span>{getStatus(move.moveStatus, 0)}</span>
                  {shouldDisplayLuckRate(move.moveStatus) && <span>{`(${getLuckRate(move.moveStatus, index)})`}</span>}
                </StatusContainer>
              </DataFieldsetFieldWithChild>
            </React.Fragment>
          ))
        )}
      </DataGrid>
    </DataBlockWithTitle>
  );
};
