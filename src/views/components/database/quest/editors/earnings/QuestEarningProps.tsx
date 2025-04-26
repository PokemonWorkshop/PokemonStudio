import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestEarning } from '@modelEntities/quest';
import { MutableRefObject, RefObject } from 'react';

export type QuestEarningProps = {
  earning: StudioQuestEarning;
  refs: {
    entityRef: MutableRefObject<DbSymbol | undefined>;
    inputRef: RefObject<HTMLInputElement>;
  };
  checkIsValid?: () => void;
};
