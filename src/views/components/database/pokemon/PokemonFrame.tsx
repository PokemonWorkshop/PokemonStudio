import { TypeCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonSpritePath } from '@modelEntities/pokemon/Pokemon.model';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getNameType } from '@utils/getNameType';
import { padStr } from '@utils/PadStr';
import React from 'react';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
  DataSpriteContainer,
} from '../dataBlocks';
import { PokemonDataProps } from './PokemonDataPropsInterface';

export const PokemonFrame = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { species, form } = pokemonWithForm;
  const [state] = useGlobalState();
  const types = state.projectData.types;

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="160px minmax(min-content, 610px) auto">
        <DataSpriteContainer type="sprite">
          <ResourceImage imagePathInProject={pokemonSpritePath(form)} />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {species?.name()}
                <span className="data-id">#{padStr(species?.id, 3)}</span>
              </h1>
              <CopyIdentifier dataToCopy={species.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={form.type1}>{getNameType(types, form.type1)}</TypeCategory>
              {form.type2 !== '__undef__' && <TypeCategory type={form.type2}>{getNameType(types, form.type2)}</TypeCategory>}
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{species.descr()}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
