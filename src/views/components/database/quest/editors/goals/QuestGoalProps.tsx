import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestObjective } from '@modelEntities/quest';
import { RefObject } from 'react';

export type QuestGoalProps = {
  objective: StudioQuestObjective;
  refs: {
    entityRef: RefObject<DbSymbol | undefined>;
    nameRef: RefObject<HTMLInputElement | null>;
    valueRef: RefObject<HTMLInputElement | null>;
    customObjectiveRef: RefObject<HTMLTextAreaElement | null>;
    hiddenByDefaultRef: RefObject<HTMLInputElement | null>;
  };
  checkIsValid?: () => void;
};
