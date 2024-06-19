import { StudioMap } from '@modelEntities/map';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectMaps } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateMap = (map: StudioMap) => {
  const { setProjectDataValues: setMap } = useProjectMaps();

  return useCallback(
    (updates: Partial<StudioMap>) => {
      const updatedMap = {
        ...cloneEntity(map),
        ...updates,
      };
      setMap({ [map.dbSymbol]: updatedMap });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  );
};
