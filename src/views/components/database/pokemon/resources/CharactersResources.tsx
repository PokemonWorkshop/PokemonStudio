import { DataBlockWrapper } from '@components/database/dataBlocks';
import PokemonForm, { CreatureFormResourcesPath } from '@modelEntities/pokemon/PokemonForm';
import React from 'react';
import { ResourcesContainer } from './ResourcesContainer';
import { SpriteResource } from './SpriteResource';
import { TitleResource } from './TitleResource';

type BattlersResourcesProps = {
  form: PokemonForm;
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
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="characterShiny"
              isFemale={false}
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
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="characterShinyF"
              isFemale={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </>
        )}
      </DataBlockWrapper>
    </ResourcesContainer>
  );
};
