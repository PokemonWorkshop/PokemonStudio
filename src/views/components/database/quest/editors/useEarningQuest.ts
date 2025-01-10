import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioQuestEarning } from '@modelEntities/quest';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useRef, useState } from 'react';

export const useEarningQuest = (initialEarning: StudioQuestEarning) => {
  const [earning, setEarning] = useState(initialEarning);
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

  const updateEarning = (earning: StudioQuestEarning) => {
    setEarning(earning);
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
