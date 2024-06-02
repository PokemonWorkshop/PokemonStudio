import React from 'react';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { useProjectPokemon } from '@utils/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import styled from 'styled-components';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonIconPath } from '@utils/path';

type PokemonZoneProps = {
  pokemon: StudioGroupEncounter;
};

const PokemonZoneListContainer = styled.div`
  width: 270px;
  display: grid;
  grid-template-columns: 32px 1fr 62px;
  gap: 16px;
  align-items: center;
  height: 70px;
  border: 2px solid ${({ theme }) => theme.colors.dark20};
  padding: 16px, 0px, 16px, 0px;
  border-radius: 8px;

  & img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
    gap: 10px;
    padding: 8px;
    radius: 8px;
  }

  & div.name-level {
    display: flex;
    flex-direction: column;
    gap: 12px;

    & span.level {
      color: ${({ theme }) => theme.colors.text400};
    }
  }
`;

export const ZonePokemonList = ({ pokemon }: PokemonZoneProps) => {
  const { projectDataValues: species } = useProjectPokemon();
  const getEntityName = useGetEntityNameText();
  const specie = species[pokemon.specie];

  const iconSelector = (pokemon: StudioGroupEncounter) => {
    const isFemale = pokemon.expandPokemonSetup.find((setup) => setup.type === 'gender')?.value === 2;
    if (pokemon.shinySetup.kind === 'rate' && pokemon.shinySetup.rate === 1) {
      return isFemale ? 'iconShinyF' : 'iconShiny';
    }
    return isFemale ? 'iconF' : 'icon';
  };
  return (
    <PokemonZoneListContainer>
      {specie ? (
        <ResourceImage
          imagePathInProject={pokemonIconPath(specie, pokemon.form, iconSelector(pokemon))}
          fallback={pokemon.form === 0 ? undefined : pokemonIconPath(specie)}
        />
      ) : (
        <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
      )}
      <div className="name-level">
        <span>{specie ? getEntityName(specie) : 'Unknown'}</span>
        {/* //TODO: Que faut-il recuperer ici ? */}
        <span className="level">toto</span>
      </div>
    </PokemonZoneListContainer>
  );
};
