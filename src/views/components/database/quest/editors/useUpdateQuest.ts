import { StudioQuest } from '@modelEntities/quest';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectQuests } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateQuest = (quest: StudioQuest) => {
  const { setProjectDataValues: setQuest } = useProjectQuests();

  return useCallback(
    (updates: Partial<StudioQuest>) => {
      const updatedQuest = {
        ...cloneEntity(quest),
        ...updates,
      };
      setQuest({ [quest.dbSymbol]: updatedQuest });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quest]
  );
};
