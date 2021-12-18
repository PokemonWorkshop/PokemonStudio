import { MoveCategory, TypeCategory } from '@components/categories';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getNameType } from '@utils/getNameType';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import { MoveDataProps } from './MoveDataPropsInterface';

export const MoveFrame = ({ move, onClick }: MoveDataProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_moves']);

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{move.name()}</h1>
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={move.type}>{getNameType(state.projectData.types, move.type)}</TypeCategory>
              <MoveCategory category={move.category}>{t(`database_moves:${move.category}` as never)}</MoveCategory>
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{move.descr()}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
