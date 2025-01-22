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
    let result = false;
    switch (earning.earningMethodName) {
      case 'earning_money':
        result = !!inputRef.current && inputRef.current.validity.valid;
        break;
      case 'earning_item':
        result = !!entityRef.current && !!inputRef.current && inputRef.current.validity.valid;
        break;
      case 'earning_pokemon':
      case 'earning_egg':
        result = !!entityRef.current;
        break;
      default:
        assertUnreachable(earning.earningMethodName);
    }
    setIsValid(result);
    return result;
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
