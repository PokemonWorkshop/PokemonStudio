import type { StudioMapLink } from '@modelEntities/mapLink';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectMapLinks } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateMapLink = (mapLink: StudioMapLink) => {
  const { setProjectDataValues: setMapLink } = useProjectMapLinks();

  return useCallback(
    (updates: Partial<StudioMapLink>) => {
      const updatedMapLink = {
        ...cloneEntity(mapLink),
        ...updates,
      };
      setMapLink({ [mapLink.dbSymbol]: updatedMapLink });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapLink]
  );
};
