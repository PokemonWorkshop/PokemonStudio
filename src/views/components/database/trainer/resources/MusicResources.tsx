import React from 'react';
import { useTranslation } from 'react-i18next';
import { OtherResource, ResourceWrapper, ResourcesContainer, TitleResource } from '@components/resources';
import { TrainerMusicsPath, trainerResourcePath } from '@utils/path';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { StudioTrainer } from '@modelEntities/trainer';
import { useUpdateResources } from './useUpdateResources';

type MusicResourcesProps = {
  trainer: StudioTrainer;
};

export const MusicResources = ({ trainer }: MusicResourcesProps) => {
  const { t } = useTranslation('database_trainers');
  const { onResourceMusicsChoosen, onResourceMusicsClean } = useUpdateResources(trainer);

  return (
    <ResourcesContainer>
      <TitleResource title={t('musics')} />
      <ResourceWrapper size="half">
        {(['encounter', 'bgm', 'defeat', 'victory'] as TrainerMusicsPath[]).map((resource) => (
          <OtherResource
            type="music"
            title={t(`${resource}_music`)}
            resourcePath={trainerResourcePath(trainer, resource)}
            extensions={AUDIO_EXT}
            onResourceChoosen={(resourcePath) => onResourceMusicsChoosen(resourcePath, resource)}
            onResourceClean={() => onResourceMusicsClean(resource)}
            key={resource}
          />
        ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
