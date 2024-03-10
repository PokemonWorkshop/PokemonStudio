import { StudioProject } from '@modelEntities/project';
import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';
import { useProjectStudio } from './useProjectStudio';

export const useUpdateProjectStudio = (projectStudio: StudioProject) => {
  const { setProjectStudioValues: setProjectStudio } = useProjectStudio();

  return useCallback(
    (updates: Partial<StudioProject>) => {
      const updatedProjectStudio = {
        ...cloneEntity(projectStudio),
        ...updates,
      };
      setProjectStudio(updatedProjectStudio);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectStudio]
  );
};
