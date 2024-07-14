import React from 'react';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { useProjectPokemon } from '@hooks/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import styled from 'styled-components';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonIconPath } from '@utils/path';
import { useTranslation } from 'react-i18next';

type PokemonZoneProps = {
  pokemon: StudioGroupEncounter;
};

const PokemonZoneListContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  height: 70px;

  & img {
    width: 32px;
    height: 32px;
  }

  & div.name-form {
    display: flex;
    flex-direction: column;
    ${({ theme }) => theme.fonts.normalMedium}

    & span.form {
      color: ${({ theme }) => theme.colors.text400};
      ${({ theme }) => theme.fonts.normalRegular}
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
      return `${t('mega_evolution')} ${pokemon.form - 29}`;
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
      <div className="name-form">
        <span>{specie ? getEntityName(specie) : 'Unknown'}</span>
        <span className="form">{getForm(pokemon)}</span>
      </div>
    </PokemonZoneListContainer>
  );
};
