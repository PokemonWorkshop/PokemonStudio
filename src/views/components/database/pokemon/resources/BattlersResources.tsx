import { DataBlockWrapper } from '@components/database/dataBlocks';
import { StudioCreatureForm } from '@modelEntities/creature';
import { CreatureFormResourcesPath } from '@utils/path';
import React from 'react';
import { ResourcesContainer } from './ResourcesContainer';
import { SpriteResource } from './SpriteResource';
import { TitleResource, TitleResourceWithToggle } from './TitleResource';

type BattlersResourcesProps = {
  form: StudioCreatureForm;
  isShowFemale: boolean;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
  onShowFemale: (female: boolean) => void;
};

export const BattlersResources = ({ form, isShowFemale, onResourceChoosen, onResourceClean, onShowFemale }: BattlersResourcesProps) => {
  return (
    <ResourcesContainer>
      {form.femaleRate === -1 || form.femaleRate === 0 || form.femaleRate === 100 ? (
        <TitleResource title="Battlers" />
      ) : (
        <TitleResourceWithToggle title="Battlers" onShowFemale={onShowFemale} isShowFemale={isShowFemale} />
      )}
      <DataBlockWrapper>
        {form.femaleRate !== 100 && (
          <>
            <SpriteResource
              form={form}
              resource="front"
              isFemale={false}
              canBeFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="back"
              isFemale={false}
              canBeFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="frontShiny"
              isFemale={false}
              canBeFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="backShiny"
              isFemale={false}
              canBeFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </>
        )}
        {isShowFemale && (
          <>
            <SpriteResource
              form={form}
              resource="frontF"
              isFemale={true}
              canBeFemale={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="backF"
              isFemale={true}
              canBeFemale={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="frontShinyF"
              isFemale={true}
              canBeFemale={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
            <SpriteResource
              form={form}
              resource="backShinyF"
              isFemale={true}
              canBeFemale={true}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </>
        )}
      </DataBlockWrapper>
    </ResourcesContainer>
  );
};
