import { StudioItem } from '@modelEntities/item';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectItems } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateItem = (item: StudioItem) => {
  const { setProjectDataValues: setItem } = useProjectItems();

  return useCallback(
    (updates: Partial<StudioItem>) => {
      const updatedItem = {
        ...cloneEntity(item),
        ...updates,
      };
      setItem({ [item.dbSymbol]: updatedItem as StudioItem });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item]
  );
};
