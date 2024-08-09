import { StudioItem } from '@modelEntities/item';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectItems } from '@hooks/useProjectData';
import { useCallback } from 'react';

export type RemoveKeys = (obj: Record<string, unknown>, keys: string[]) => Record<string, unknown>;

const removeKeys: RemoveKeys = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

export const useUpdateItem = (item: StudioItem) => {
  const { setProjectDataValues: setItem } = useProjectItems();

  return useCallback(
    (updates: Partial<StudioItem>, removeKeysList: string[] = []) => {
      const updatedItem = {
        ...cloneEntity(item),
        ...updates,
      };

      const cleanedItem = removeKeys(updatedItem, removeKeysList);

      setItem({ [item.dbSymbol]: cleanedItem as StudioItem });
    },
    [item, setItem]
  );
};
