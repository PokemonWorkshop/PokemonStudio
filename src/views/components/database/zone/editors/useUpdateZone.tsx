import { useCallback } from 'react';
import { StudioZone } from '@modelEntities/zone';
import { useProjectZones } from '@hooks/useProjectData';
import { cloneEntity } from '@utils/cloneEntity';

export const useUpdateZone = (zone: StudioZone) => {
  const { setProjectDataValues: setZone } = useProjectZones();

  return useCallback(
    (updates: Partial<StudioZone>) => {
      const updatedZone = {
        ...cloneEntity(zone),
        ...updates,
      };
      setZone({ [zone.dbSymbol]: updatedZone });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zone]
  );
};
