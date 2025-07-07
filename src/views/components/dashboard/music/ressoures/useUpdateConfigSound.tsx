import { SoundDesignConfig, SoundEffectsKeys, SoundLocated } from '@modelEntities/config';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { useCallback } from 'react';
import { cloneEntity } from '@utils/cloneEntity';
import { basename } from '@utils/path';
import { AudioFile } from '@modelEntities/common';

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

  const onResourceUpdate = (resource: Partial<AudioFile>, resourceKey: SoundEffectsKeys, located: SoundLocated) => {
    const currentLocated = soundDesign[located] as Record<string, AudioFile> | undefined;
    const currentResource = currentLocated?.[resourceKey];

    updateSoundDesign({
      [located]: {
        ...currentLocated,
        [resourceKey]: {
          ...currentResource,
          ...resource,
        },
      },
    });
  };

  const onResourceMusicsChoosen = (resource: string, resourceKey: SoundEffectsKeys, located: SoundLocated) => {
    const currentLocated = soundDesign[located] as Record<string, AudioFile> | undefined;
    updateSoundDesign({
      [located]: {
        ...currentLocated,
        [resourceKey]: {
          name: basename(resource),
          volume: 100,
          pitch: 100,
        },
      },
    });
  };

  const onResourceMusicsClean = (resourceKey: SoundEffectsKeys, located: SoundLocated) => {
    const currentLocated = soundDesign[located] as Record<string, AudioFile> | undefined;

    if (currentLocated) {
      const currentResource = currentLocated[resourceKey];
      updateSoundDesign({
        [located]: {
          ...currentLocated,
          [resourceKey]: {
            ...currentResource,
            // If replace by null, some errors occurs in when you reload the project
            name: '',
          },
        },
      });
    }
  };

  return {
    onResourceUpdate,
    onResourceMusicsChoosen,
    onResourceMusicsClean,
  };
};
