import React from 'react';
import { useTrainerPage } from '@utils/usePage';
import { useTranslation } from 'react-i18next';
import { useUpdateTrainer } from '../editors/useUpdateTrainer';
import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource } from '@components/resources';
import { TrainerResourcesPath, basename, trainerResourcePath } from '@utils/path';

export const BattlersResources = () => {
  const { t } = useTranslation('database_trainers');
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);

  const handleResourceChoosen = (resourcePath: string, resource: TrainerResourcesPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        [resource]: basename(resourcePath, '.png'),
      },
    });
  };

  const handleResourceClean = (resource: TrainerResourcesPath) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        [resource]: '',
      },
    });
  };

  const getTitle = (resource: TrainerResourcesPath) => {
    switch (resource) {
      case 'sprite':
        return 'battle_sprite';
      case 'artworkFull':
        return 'artwork_full';
      case 'artworkSmall':
        return 'artwork_small';
    }
    return 'battle_sprite';
  };

  return (
    <ResourcesContainer>
      <TitleResource title={t('battlers')} />
      <ResourceWrapper size="third">
        {(['sprite', 'artworkFull', 'artworkSmall'] as TrainerResourcesPath[]).map((resource) => (
          <SpriteResource
            type={resource === 'sprite' ? 'battleSprite' : 'artwork'}
            title={t(getTitle(resource))}
            resourcePath={trainerResourcePath(trainer, resource)}
            extensions={['png', 'gif']}
            onResourceChoosen={(resourcePath) => handleResourceChoosen(resourcePath, resource)}
            onResourceClean={() => handleResourceClean(resource)}
            key={resource}
          />
        ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
