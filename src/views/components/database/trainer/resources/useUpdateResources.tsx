import { StudioTrainer } from '@modelEntities/trainer';
import { useUpdateTrainer } from '../editors/useUpdateTrainer';
import { TrainerMusicsPath, TrainerResourcesPath, basename } from '@utils/path';

export const useUpdateResources = (trainer: StudioTrainer) => {
  const updateTrainer = useUpdateTrainer(trainer);

  const onResourceGraphicsChoosen = (resourcePath: string, resource: TrainerResourcesPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        [resource]: basename(resourcePath, '.png').replace(/\.gif$/i, ''),
      },
    });
  };

  const onResourceGraphicsClean = (resource: TrainerResourcesPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        [resource]: '',
      },
    });
  };

  const onResourceMusicsChoosen = (resourcePath: string, resource: TrainerMusicsPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        musics: {
          ...trainer.resources.musics,
          [resource]: basename(resourcePath),
        },
      },
    });
  };

  const onResourceMusicsClean = (resource: TrainerMusicsPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        musics: {
          ...trainer.resources.musics,
          [resource]: '',
        },
      },
    });
  };

  return {
    onResourceGraphicsChoosen,
    onResourceGraphicsClean,
    onResourceMusicsChoosen,
    onResourceMusicsClean,
  };
};
