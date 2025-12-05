import React from 'react';
import { DataCombosGrid, DataCombosTable, TableEmpty } from './MoveContestCombosTableStyle';
import { useTranslation } from 'react-i18next';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioMove } from '@modelEntities/move';
import { useUpdateMove } from '../editors/useUpdateMove';
import { RenderComboMove } from './RenderComboMove';
import { useProjectMoves } from '@src/hooks/useProjectData';

type MoveContestCombosTableProps = {
  move: StudioMove;
};

export const MoveContestCombosTable = ({ move }: MoveContestCombosTableProps) => {
  const updateMove = useUpdateMove(move);
  const { t } = useTranslation();
  const { projectDataValues: moves } = useProjectMoves();

  return move.comboMoves.length === 0 ? (
    <TableEmpty>{t('no_combos')}</TableEmpty>
  ) : (
    <DataCombosTable>
      <DataCombosGrid gap="48px" className="header">
        <span>{t('move')}</span>
        <span>{t('contest_condition')}</span>
      </DataCombosGrid>
      {move.comboMoves
        .sort((a, b) => {
          if (!moves[a]) return 1;
          if (!moves[b]) return -1;

          return moves[a].id - moves[b].id;
        })
        .map((cMove, index) => (
          <RenderComboMove
            key={`move-${index}`}
            moveSymbol={cMove}
            onClickDelete={() => {
              const newCombos = cloneEntity(move.comboMoves);
              newCombos.splice(index, 1);
              updateMove({ comboMoves: newCombos });
            }}
          />
        ))}
    </DataCombosTable>
  );
};
