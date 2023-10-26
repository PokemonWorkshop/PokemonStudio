import React from 'react';
import { useUpdateTrainer } from '../editors/useUpdateTrainer';
import { useTranslation } from 'react-i18next';
import { MusicResource, ResourceWrapper, ResourcesContainer, TitleResource } from '@components/resources';
import { TrainerMusicsPath, basename, trainerResourcePath } from '@utils/path';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { StudioTrainer } from '@modelEntities/trainer';

type MusicResourcesProps = {
  trainer: StudioTrainer;
};

export const MusicResources = ({ trainer }: MusicResourcesProps) => {
  const { t } = useTranslation('database_trainers');
  const updateTrainer = useUpdateTrainer(trainer);

  const handleResourceChoosen = (filePath: string, resource: TrainerMusicsPath) => {
    const filename = basename(filePath);
    updateTrainer({
      resources: {
        ...trainer.resources,
        musics: {
          ...trainer.resources.musics,
          [resource]: filename,
        },
      },
    });
  };

  const handleResourceClean = (resource: TrainerMusicsPath) => {
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

  return (
    <ResourcesContainer>
      <TitleResource title={t('musics')} />
      <ResourceWrapper size="half">
        {(['encounter', 'bgm', 'defeat', 'victory'] as TrainerMusicsPath[]).map((resource) => (
          <MusicResource
            title={t(`${resource}_music`)}
            resourcePath={trainerResourcePath(trainer, resource)}
            extensions={AUDIO_EXT}
            onResourceChoosen={(resourcePath) => handleResourceChoosen(resourcePath, resource)}
            onResourceClean={() => handleResourceClean(resource)}
            key={resource}
          />
        ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
