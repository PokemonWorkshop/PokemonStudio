import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGlobalState } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';

export const useUpdateMapModified = () => {
  const [, setState] = useGlobalState();

  return useCallback(
    (mapsModifiedUpdated: DbSymbol[]) => {
      setState((state) => ({ ...state, mapsModified: cloneEntity(mapsModifiedUpdated) }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
