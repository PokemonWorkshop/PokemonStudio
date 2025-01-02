import { StudioQuestObjective } from '@modelEntities/quest';
import { cloneEntity } from '@utils/cloneEntity';
import { useState } from 'react';

export const useUpdateObjectiveQuest = (initialObjective: StudioQuestObjective) => {
  const [objective, setObjective] = useState(initialObjective);

  const updateObjective = (index: number, value: number | string) => {
    const updatedObjective = cloneEntity(objective);
    updatedObjective.objectiveMethodArgs[index] = value;
    setObjective(updatedObjective);
  };

  return {
    objective,
    setObjective,
    updateObjective,
  };
};
