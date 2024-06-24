import { StudioTrainer } from '@modelEntities/trainer';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectTrainers } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateTrainer = (trainer: StudioTrainer) => {
  const { setProjectDataValues: setTrainer } = useProjectTrainers();

  return useCallback(
    (updates: Partial<StudioTrainer>) => {
      const updatedTrainer = {
        ...cloneEntity(trainer),
        ...updates,
      };
      setTrainer({ [trainer.dbSymbol]: updatedTrainer });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trainer]
  );
};
