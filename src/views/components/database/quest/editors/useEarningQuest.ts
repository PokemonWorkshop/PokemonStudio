import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestEarning, StudioQuestEarningType } from '@modelEntities/quest';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';
import { createQuestEarning } from '@utils/entityCreation';
import { useRef, useState } from 'react';

const initializeEarning = (initialEarning?: StudioQuestEarning): StudioQuestEarning => {
  return initialEarning ? cloneEntity(initialEarning) : createQuestEarning('earning_money');
};

export const useEarningQuest = (initialEarning?: StudioQuestEarning) => {
  const [earning, setEarning] = useState(initializeEarning(initialEarning));
  const [isValid, setIsValid] = useState<boolean>(true);
  const entityRef = useRef<DbSymbol | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const checkIsValid = () => {
    switch (earning.earningMethodName) {
      case 'earning_money':
        return setIsValid(!!inputRef.current && inputRef.current.validity.valid);
      case 'earning_item':
        return setIsValid(!!entityRef.current && !!inputRef.current && inputRef.current.validity.valid);
      case 'earning_pokemon':
      case 'earning_egg':
        return setIsValid(!!entityRef.current);
      default:
        assertUnreachable(earning.earningMethodName);
    }
    return setIsValid(true);
  };

  const updateEarning = (earningMethod: StudioQuestEarningType) => {
    setEarning(createQuestEarning(earningMethod));
    setIsValid(true);
  };

  return {
    earning,
    refs: {
      entityRef,
      inputRef,
    },
    updateEarning,
    checkIsValid,
    isValid,
  };
};
