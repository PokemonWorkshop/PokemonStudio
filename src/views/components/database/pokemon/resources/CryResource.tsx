import { OtherResource, ResourceWrapper, ResourcesContainer, TitleResource } from '@components/resources';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { formResourcesPath } from '@utils/path';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateResources } from './useUpdateResources';
import { AUDIO_EXT } from '@components/inputs/AudioInput';

type CryResourceProps = {
  creature: StudioCreature;
  form: StudioCreatureForm;
};

export const CryResource = ({ creature, form }: CryResourceProps) => {
  const { t } = useTranslation('database_pokemon');
  const { onCryChoosen, onResourceClean } = useUpdateResources(creature, form);

  return (
    <ResourcesContainer>
      <TitleResource title={t('cry')} />
      <ResourceWrapper size="half">
        <OtherResource
          type="music"
          title={t('pokemon_cry')}
          resourcePath={formResourcesPath(form, 'cry')}
          extensions={AUDIO_EXT}
          onResourceChoosen={(resourcePath) => onCryChoosen(resourcePath)}
          onResourceClean={() => onResourceClean('cry')}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
