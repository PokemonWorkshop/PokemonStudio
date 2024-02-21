import { OtherResource, ResourceWrapper, ResourcesContainer, TitleResource } from '@components/resources';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { CreatureFormResourcesFemalePath, CreatureFormResourcesPath, formResourcesPath } from '@utils/path';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateResources } from './useUpdateResources';
import { useTitleResource } from './useTitleResource';

type IconsResourcesProps = {
  creature: StudioCreature;
  form: StudioCreatureForm;
  canShowFemale: boolean;
};

export const IconsResources = ({ creature, form, canShowFemale }: IconsResourcesProps) => {
  const { t } = useTranslation('database_pokemon');
  const { onResourceChoosen, onResourceClean } = useUpdateResources(creature, form);
  const titleResource = useTitleResource();

  return (
    <ResourcesContainer>
      <TitleResource title={t('icons')} />
      <ResourceWrapper size="half">
        {form.femaleRate !== 100 &&
          (['icon', 'iconShiny'] as CreatureFormResourcesPath[]).map((resource) => (
            <OtherResource
              type="icon"
              title={titleResource(resource, false, canShowFemale)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png', 'gif']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
        {canShowFemale &&
          (['iconF', 'iconShinyF'] as CreatureFormResourcesFemalePath[]).map((resource) => (
            <OtherResource
              type="icon"
              title={titleResource(resource, true, true)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png', 'gif']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
        <OtherResource
          type="icon"
          title={t('footprint')}
          resourcePath={formResourcesPath(form, 'footprint')}
          extensions={['png']}
          onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, 'footprint')}
          onResourceClean={() => onResourceClean('footprint')}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
