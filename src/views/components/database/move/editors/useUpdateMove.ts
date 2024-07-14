import { StudioMove } from '@modelEntities/move';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectMoves } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateMove = (move: StudioMove) => {
  const { setProjectDataValues: setMove } = useProjectMoves();

  return useCallback(
    (updates: Partial<StudioMove>) => {
      const updatedMove = {
        ...cloneEntity(move),
        ...updates,
      };
      setMove({ [move.dbSymbol]: updatedMove });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [move]
  );
};
