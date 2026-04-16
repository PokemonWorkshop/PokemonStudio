import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestEarning } from '@modelEntities/quest';
import { RefObject } from 'react';

export type QuestEarningProps = {
  earning: StudioQuestEarning;
  refs: {
    entityRef: RefObject<DbSymbol | undefined>;
    inputRef: RefObject<HTMLInputElement | null>;
  };
  checkIsValid?: () => void;
};
