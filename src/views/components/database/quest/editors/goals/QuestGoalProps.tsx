import { StudioQuestObjective } from '@modelEntities/quest';

export type QuestGoalProps = {
  objective: StudioQuestObjective;
  setObjective: (objective: StudioQuestObjective) => void;
};

export type QuestUpdateGoalProps = {
  objective: StudioQuestObjective;
  updateObjective: (index: number, value: number | string) => void;
};
