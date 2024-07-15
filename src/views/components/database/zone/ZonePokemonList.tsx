import React from 'react';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { useProjectPokemon } from '@hooks/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import styled from 'styled-components';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonIconPath } from '@utils/path';
import { useTranslation } from 'react-i18next';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation } from '@hooks/useShortcutNavigation';

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
    object-fit: cover;
    object-position: 0 100%;
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

    & span.error {
      ${({ theme }) => theme.fonts.normalMedium};
      color: ${({ theme }) => theme.colors.dangerBase};
    }

    & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

export const ZonePokemonList = ({ pokemon }: PokemonZoneProps) => {
  const { projectDataValues: species } = useProjectPokemon();
  const getEntityName = useGetEntityNameText();
  const specie = species[pokemon.specie];
  const { t } = useTranslation(['database_zones', 'database_pokemon']);
  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();

  const iconSelector = (pokemon: StudioGroupEncounter) => {
    const isFemale = pokemon.expandPokemonSetup.find((setup) => setup.type === 'gender')?.value === 2;
    if (pokemon.shinySetup.kind === 'rate' && pokemon.shinySetup.rate === 1) {
      return isFemale ? 'iconShinyF' : 'iconShiny';
    }
    return isFemale ? 'iconF' : 'icon';
  };

  const getForm = (pokemon: StudioGroupEncounter) => {
    if (pokemon.form === 0) {
      return t('database_zones:default_form');
    } else if (pokemon.form >= 30) {
      return `${t('database_zones:mega_evolution')} ${pokemon.form - 29}`;
    } else {
      return `${t('database_zones:form')} ${pokemon.form}`;
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
        {specie ? (
          <span
            onClick={isClickable ? () => shortcutPokemonNavigation(specie.dbSymbol, pokemon.form) : undefined}
            className={isClickable ? 'clickable' : undefined}
          >
            {getEntityName(specie)}
          </span>
        ) : (
          <span className="error">{t('database_pokemon:pokemon_deleted')}</span>
        )}
        <span className="form">{getForm(pokemon)}</span>
      </div>
    </PokemonZoneListContainer>
  );
};
