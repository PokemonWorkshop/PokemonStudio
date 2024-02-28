import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource } from '@components/resources';
import { TrainerResourcesPath, trainerResourcePath } from '@utils/path';
import { StudioTrainer } from '@modelEntities/trainer';
import { useUpdateResources } from './useUpdateResources';
import { useTitleResource } from './useTitleResource';

type BattlersResourcesProps = {
  trainer: StudioTrainer;
};

export const BattlersResources = ({ trainer }: BattlersResourcesProps) => {
  const { t } = useTranslation('database_trainers');
  const { onResourceGraphicsChoosen, onResourceGraphicsClean } = useUpdateResources(trainer);
  const titleResource = useTitleResource();

  return (
    <ResourcesContainer>
      <TitleResource title={t('battlers')} />
      <ResourceWrapper size="third">
        {(['sprite', 'artworkFull', 'artworkSmall'] as TrainerResourcesPath[]).map((resource) => (
          <SpriteResource
            type={resource === 'sprite' ? 'battleSprite' : 'artwork'}
            title={titleResource(resource)}
            resourcePath={trainerResourcePath(trainer, resource)}
            extensions={['png', 'gif']}
            onResourceChoosen={(resourcePath) => onResourceGraphicsChoosen(resourcePath, resource)}
            onResourceClean={() => onResourceGraphicsClean(resource)}
            key={resource}
          />
        ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
