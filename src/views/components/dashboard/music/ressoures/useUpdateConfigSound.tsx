import { SoundDesignConfig, SoundEffectsKeys } from '@modelEntities/config';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { useCallback } from 'react';
import { cloneEntity } from '@utils/cloneEntity';
import { basename } from '@utils/path';

export const useUpdateConfigSound = (soundDesign: SoundDesignConfig) => {
  const { setProjectConfigValues: setSoundDesign } = useConfigSoundDesign();

  return useCallback(
    (updates: Partial<SoundDesignConfig>) => {
      const updatedSoundDesign = {
        ...cloneEntity(soundDesign),
        ...updates,
      };
      setSoundDesign(updatedSoundDesign);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [soundDesign]
  );
};

export const useUpdateConfigMusic = (soundDesign: SoundDesignConfig) => {
  const updateSoundDesign = useUpdateConfigSound(soundDesign);

  const onResourceMusicsChoosen = (resourcePath: string, resource: SoundEffectsKeys) => {
    updateSoundDesign({
      [resource]: basename(resourcePath),
    });
  };

  const onResourceMusicsClean = (resource: SoundEffectsKeys) => {
    updateSoundDesign({
      [resource]: '',
    });
  };

  return {
    onResourceMusicsChoosen,
    onResourceMusicsClean,
  };
};
