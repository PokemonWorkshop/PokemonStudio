import { useProjectTrainerClasses } from '@hooks/useProjectData';
import { StudioTrainerClass } from '@modelEntities/trainerClass';
import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';

export const useUpdateTrainerClass = (trainerClass: StudioTrainerClass) => {
  const { setProjectDataValues: setTrainerClass } = useProjectTrainerClasses();

  return useCallback(
    (updates: Partial<StudioTrainerClass>) => {
      const updatedTrainerClass = {
        ...cloneEntity(trainerClass),
        ...updates,
      };
      setTrainerClass({ [trainerClass.dbSymbol]: updatedTrainerClass });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trainerClass],
  );
};
