import { StudioCreatureForm } from '@modelEntities/creature';
import { CreatureFormResourcesPath } from '@utils/path';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconResource } from './IconResource';
import { ResourcesContainer } from './ResourcesContainer';
import { ResourceWrapper } from './ResourceWrapper';
import { TitleResource } from './TitleResource';

type IconsResourcesProps = {
  form: StudioCreatureForm;
  isShowFemale: boolean;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
};

export const IconsResources = ({ form, isShowFemale, onResourceChoosen, onResourceClean }: IconsResourcesProps) => {
  const { t } = useTranslation('database_pokemon');
  return (
    <ResourcesContainer>
      <TitleResource title={t('icons')} />
      <ResourceWrapper>
        {form.femaleRate !== 100 && (
          <>
            <IconResource form={form} resource="icon" isFemale={false} onResourceChoosen={onResourceChoosen} onResourceClean={onResourceClean} />
            <IconResource form={form} resource="iconShiny" isFemale={false} onResourceChoosen={onResourceChoosen} onResourceClean={onResourceClean} />
          </>
        )}
        {isShowFemale && (
          <>
            <IconResource form={form} resource="iconF" isFemale={true} onResourceChoosen={onResourceChoosen} onResourceClean={onResourceClean} />
            <IconResource form={form} resource="iconShinyF" isFemale={true} onResourceChoosen={onResourceChoosen} onResourceClean={onResourceClean} />
          </>
        )}
        <IconResource form={form} resource="footprint" isFemale={false} onResourceChoosen={onResourceChoosen} onResourceClean={onResourceClean} />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
