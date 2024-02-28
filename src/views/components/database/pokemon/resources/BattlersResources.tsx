import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource, TitleResourceWithToggle } from '@components/resources';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreatureFormResourcesFemalePath, CreatureFormResourcesPath, formResourcesPath } from '@utils/path';
import { useUpdateResources } from './useUpdateResources';
import { useTitleResource } from './useTitleResource';

type BattlersResourcesProps = {
  creature: StudioCreature;
  form: StudioCreatureForm;
  canShowFemale: boolean;
};

export const BattlersResources = ({ creature, form, canShowFemale }: BattlersResourcesProps) => {
  const { t } = useTranslation('database_pokemon');
  const { onResourceChoosen, onResourceClean, onShowFemale } = useUpdateResources(creature, form);
  const titleResource = useTitleResource();

  return (
    <ResourcesContainer>
      {form.femaleRate === -1 || form.femaleRate === 0 || form.femaleRate === 100 ? (
        <TitleResource title="Battlers" />
      ) : (
        <TitleResourceWithToggle title="Battlers" isShow={canShowFemale} onShow={onShowFemale} toggleText={t('show_female_sprites')} />
      )}
      <ResourceWrapper size="fourth">
        {form.femaleRate !== 100 &&
          (['front', 'back', 'frontShiny', 'backShiny'] as CreatureFormResourcesPath[]).map((resource) => (
            <SpriteResource
              type="creature"
              title={titleResource(resource, false, canShowFemale)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png', 'gif']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
        {canShowFemale &&
          (['frontF', 'backF', 'frontShinyF', 'backShinyF'] as CreatureFormResourcesFemalePath[]).map((resource) => (
            <SpriteResource
              type="creature"
              title={titleResource(resource, true, true)}
              resourcePath={formResourcesPath(form, resource)}
              extensions={['png', 'gif']}
              onResourceChoosen={(resourcePath) => onResourceChoosen(resourcePath, resource)}
              onResourceClean={() => onResourceClean(resource)}
              key={resource}
            />
          ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
