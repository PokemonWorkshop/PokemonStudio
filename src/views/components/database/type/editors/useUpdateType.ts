import { StudioType } from '@modelEntities/type';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectTypes } from '@utils/useProjectData';
import { useCallback } from 'react';

export const useUpdateType = (type: StudioType) => {
  const { setProjectDataValues: setType } = useProjectTypes();

  return useCallback(
    (updates: Partial<StudioType>) => {
      const updatedType = {
        ...cloneEntity(type),
        ...updates,
      };
      setType({ [type.dbSymbol]: updatedType });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );
};
