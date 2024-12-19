import { StudioQuestObjective } from '@modelEntities/quest';

export type QuestGoalProps = {
  objective: StudioQuestObjective;
  setObjective: (objective: StudioQuestObjective) => void;
};
