import { DataBlockWrapper } from '@components/database/dataBlocks';
import { StudioCreatureForm } from '@modelEntities/creature';
import { CreatureFormResourcesPath } from '@utils/path';
import React from 'react';
import { ResourcesContainer } from './ResourcesContainer';
import { SpriteResource } from './SpriteResource';
import { TitleResource } from './TitleResource';

type BattlersResourcesProps = {
  form: StudioCreatureForm;
  isShowFemale: boolean;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
};

export const CharactersResources = ({ form, isShowFemale, onResourceChoosen, onResourceClean }: BattlersResourcesProps) => {
  return (
    <ResourcesContainer>
      <TitleResource title="Characters" />
      <DataBlockWrapper>
        {form.femaleRate !== 100 && (
          <>
            <SpriteResource
              form={form}
              resource="character"
              isFemale={false}
              canBeFemale={isShowFemale}
              disableGif={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="characterShiny"
              isFemale={false}
              canBeFemale={isShowFemale}
              disableGif={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </>
        )}
        {isShowFemale && (
          <>
            <SpriteResource
              form={form}
              resource="characterF"
              isFemale={true}
              canBeFemale={true}
              disableGif={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="characterShinyF"
              isFemale={true}
              canBeFemale={true}
              disableGif={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </>
        )}
      </DataBlockWrapper>
    </ResourcesContainer>
  );
};
