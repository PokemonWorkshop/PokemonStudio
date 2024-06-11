import { cloneEntity } from '@utils/cloneEntity';
import { StudioMove, StudioMoveStatusList } from '@modelEntities/move';
import { useEffect, useState } from 'react';

export const useMoveStatus = (moveWithStatus: StudioMove) => {
  // We use states here because we need a lot of control over the values to satisfy the UX
  const [status, setStatus] = useState<StudioMoveStatusList[]>(cloneEntity(moveWithStatus.moveStatus.map((s) => s.status)));
  const [chances, setChances] = useState<number[]>(cloneEntity(moveWithStatus.moveStatus.map(({ luckRate }) => luckRate)));
  const [error, setError] = useState<string>('');
  const isInitialStateStandard =
    (chances[0] === 100 && chances[1] === 1 && chances[2] === 1) ||
    (chances[0] === 50 && chances[1] === 50 && chances[2] === 1) ||
    (chances[0] === 33 && chances[1] === 33 && chances[2] === 33);

  const resetStatusesFrom = (startIndex: number) => {
    setStatus((status) => {
      const newStatus = cloneEntity(status);
      newStatus.forEach((_, index) => {
        if (index < startIndex) return;
        newStatus[index] = '__undef__';
      });
      return newStatus;
    });
  };

  const handleStatusChange = (index: number, value: string) => {
    const newValue = value as StudioMoveStatusList;
    setStatus((status) => {
      const newStatus = cloneEntity(status);
      newStatus[index] = newValue;
      return newStatus;
    });

    if (newValue === '__undef__') {
      resetStatusesFrom(index);
      if (index === 0) setChances([1, 1, 1]);
      if (index === 1) setChances([100, 1, 1]);
      if (index === 2) setChances([50, 50, 1]);
    } else {
      switch (index) {
        case 0:
          setChances([100, 1, 1]);
          break;
        case 1:
          if (isInitialStateStandard) {
            setChances([50, 50, 1]);
          }
          break;
        case 2:
          if (isInitialStateStandard) {
            setChances([33, 33, 33]);
          }
          break;
      }
    }
  };

  const handleChancesChange = (index: number, chance: number) => {
    setChances((chances) => {
      const newChances = cloneEntity(chances);
      newChances[index] = chance;
      return newChances;
    });
  };

  useEffect(() => {
    setError('');
  }, [status, chances]);

  return { statuses: status, chances, error, handleStatusChange, handleChancesChange, setError };
};
