import { StudioGameOptionConfig } from '@modelEntities/config';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigGameOptions } from '@utils/useProjectConfig';
import { useCallback } from 'react';

export const useUpdateGameOptions = (gameOptions: StudioGameOptionConfig) => {
  const { setProjectConfigValues: setGameOptions } = useConfigGameOptions();

  return useCallback(
    (updates: Partial<StudioGameOptionConfig>) => {
      const updatedGameOption = {
        ...cloneEntity(gameOptions),
        ...updates,
      };
      setGameOptions(updatedGameOption);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameOptions]
  );
};
