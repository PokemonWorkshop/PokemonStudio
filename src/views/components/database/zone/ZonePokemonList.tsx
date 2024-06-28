import React from 'react';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { useProjectPokemon } from '@utils/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import styled from 'styled-components';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonIconPath } from '@utils/path';
import { useTranslation } from 'react-i18next';

type PokemonZoneProps = {
  pokemon: StudioGroupEncounter;
};

const PokemonZoneListContainer = styled.div`
  width: 220px;
  display: grid;
  grid-template-columns: 32px 1fr 62px;
  gap: 16px;
  align-items: center;
  height: 70px;

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
      white-space: nowrap;
    }
  }
`;

export const ZonePokemonList = ({ pokemon }: PokemonZoneProps) => {
  const { projectDataValues: species } = useProjectPokemon();
  const getEntityName = useGetEntityNameText();
  const specie = species[pokemon.specie];
  const { t } = useTranslation('database_zones');

  const iconSelector = (pokemon: StudioGroupEncounter) => {
    const isFemale = pokemon.expandPokemonSetup.find((setup) => setup.type === 'gender')?.value === 2;
    if (pokemon.shinySetup.kind === 'rate' && pokemon.shinySetup.rate === 1) {
      return isFemale ? 'iconShinyF' : 'iconShiny';
    }
    return isFemale ? 'iconF' : 'icon';
  };

  const getForm = (pokemon: StudioGroupEncounter) => {
    if (pokemon.form === 0) {
      return t('default_form');
    } else if (pokemon.form >= 30) {
      return `${t('mega_evolution')}${pokemon.form}`;
    } else {
      return `${t('form')} ${pokemon.form}`;
    }
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
        <span className="level">{getForm(pokemon)}</span>
      </div>
    </PokemonZoneListContainer>
  );
};
