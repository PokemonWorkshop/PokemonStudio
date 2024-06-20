import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';
import { StudioSceneTitleConfig } from '@modelEntities/config';
import { useConfigSceneTitle } from '@utils/useProjectConfig';

export const useUpdateGameStart = (gameStart: StudioSceneTitleConfig) => {
  const { setProjectConfigValues: setGameStart } = useConfigSceneTitle();

  return useCallback(
    (updates: Partial<StudioSceneTitleConfig>) => {
      const updatedGameStart = {
        ...cloneEntity(gameStart),
        ...updates,
      };
      setGameStart(updatedGameStart);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameStart]
  );
};
