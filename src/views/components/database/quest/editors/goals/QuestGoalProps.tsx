import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestObjective } from '@modelEntities/quest';
import { MutableRefObject, RefObject } from 'react';

export type QuestGoalProps = {
  objective: StudioQuestObjective;
  refs: {
    entityRef: MutableRefObject<DbSymbol | undefined>;
    nameRef: RefObject<HTMLInputElement>;
    valueRef: RefObject<HTMLInputElement>;
  };
  checkIsValid?: () => void;
};
