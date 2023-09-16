import { StudioGroup } from '@modelEntities/group';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectGroups } from '@utils/useProjectData';
import { useCallback } from 'react';

export const useUpdateGroup = (group: StudioGroup) => {
  const { setProjectDataValues: setGroup } = useProjectGroups();

  return useCallback(
    (updates: Partial<StudioGroup>) => {
      const updatedGroup = {
        ...cloneEntity(group),
        ...updates,
      };
      setGroup({ [group.dbSymbol]: updatedGroup });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group]
  );
};
