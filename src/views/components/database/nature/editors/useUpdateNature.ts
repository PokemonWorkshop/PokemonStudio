import type { StudioNature } from '@modelEntities/nature';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectNatures } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateNature = (nature: StudioNature) => {
  const { setProjectDataValues: setNature } = useProjectNatures();

  return useCallback(
    (updates: Partial<StudioNature>) => {
      const updatedNature = {
        ...cloneEntity(nature),
        ...updates,
      };
      setNature({ [nature.dbSymbol]: updatedNature });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nature]
  );
};
