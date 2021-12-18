import { MoveCategory, TypeCategory } from '@components/categories';
import MoveModel from '@modelEntities/move/Move.model';
import TypeModel from '@modelEntities/type/Type.model';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataGrid } from '../dataBlocks';

type TypeMovesTableProps = {
  type: TypeModel;
};

type RenderMoveProps = {
  move: MoveModel;
  state: State;
  t: TFunction<'database_types'>;
};

const DataMoveTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  & div:first-child {
    padding: 0 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark14};
  }
`;

const DataMoveGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 180px 75px 75px 49px 87px 82px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }

  & .name {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.text100};
  }

  & span:nth-child(4),
  & span:nth-child(5),
  & span:nth-child(6) {
    text-align: right;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 160px 75px 32px 78px 73px;

    & span:nth-child(2) {
      display: none;
    }
  }
`;

const RenderMoveContainer = styled(DataMoveGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px 0 8px;
  margin: 0 -8px 0 -8px;
`;

const RenderMove = ({ move, state, t }: RenderMoveProps) => (
  <RenderMoveContainer gap="8px">
    <span className="name">{move.name()}</span>
    <TypeCategory type={move.type}>{state.projectData.types[move.type].name()}</TypeCategory>
    <MoveCategory category={move.category}>{t(move.category as never)}</MoveCategory>
    <span>{move.pp}</span>
    <span>{move.power || '---'}</span>
    <span>{move.accuracy || '---'}</span>
  </RenderMoveContainer>
);

export const TypeMovesTable = ({ type }: TypeMovesTableProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_types');
  const allMoves = type.getMovesWithCurrentType(state);

  return (
    <DataMoveTable>
      <DataMoveGrid gap="8px" className="header">
        <span>{t('moves_move')}</span>
        <span>{t('moves_type')}</span>
        <span>{t('moves_category')}</span>
        <span>{t('moves_pp')}</span>
        <span>{t('moves_power')}</span>
        <span>{t('moves_accuracy')}</span>
      </DataMoveGrid>
      {allMoves.map((move) => (
        <RenderMove key={`type-moves-${move.dbSymbol}`} move={move} t={t} state={state} />
      ))}
    </DataMoveTable>
  );
};
