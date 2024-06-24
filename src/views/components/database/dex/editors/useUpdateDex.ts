import { StudioDex } from '@modelEntities/dex';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectDex } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateDex = (dex: StudioDex) => {
  const { setProjectDataValues: setDex } = useProjectDex();

  return useCallback(
    (updates: Partial<StudioDex>) => {
      const updatedDex = {
        ...cloneEntity(dex),
        ...updates,
      };
      setDex({ [dex.dbSymbol]: updatedDex });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dex]
  );
};
