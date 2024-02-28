import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource } from '@components/resources';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { CreatureFormResourcesFemalePath, CreatureFormResourcesPath, formResourcesPath } from '@utils/path';
import React from 'react';
import { useUpdateResources } from './useUpdateResources';
import { useTitleResource } from './useTitleResource';

type CharactersResourcesProps = {
  creature: StudioCreature;
  form: StudioCreatureForm;
  canShowFemale: boolean;
};

export const CharactersResources = ({ creature, form, canShowFemale }: CharactersResourcesProps) => {
  const { onResourceChoosen, onResourceClean } = useUpdateResources(creature, form);
  const titleResource = useTitleResource();

  return (
    <ResourcesContainer>
      <TitleResource title="Characters" />
      <ResourceWrapper size="fourth">
        {form.femaleRate !== 100 &&
          (['character', 'characterShiny'] as CreatureFormResourcesPath[]).map((resource) => (
            <SpriteResource
              type="character"
              title={titleResource(resource, false, canShowFemale)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
        {canShowFemale &&
          (['characterF', 'characterShinyF'] as CreatureFormResourcesFemalePath[]).map((resource) => (
            <SpriteResource
              type="character"
              title={titleResource(resource, true, true)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
