import { TypeCategory } from '@components/categories';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataGrid } from '../dataBlocks';
import { useProjectAbilities } from '@hooks/useProjectData';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { pokemonIconPath } from '@utils/path';
import { StudioCreature } from '@modelEntities/creature';
import { StudioType } from '@modelEntities/type';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation, useShortcutNavigation } from '@hooks/useShortcutNavigation';

type TypePokemonTableProps = {
  type: StudioType;
};

type RenderMoveProps = {
  pokemon: StudioCreature;
  type: StudioType;
  state: State;
};

const DataPokemonTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  & div:first-child {
    padding: 0 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark14};
  }
`;

const DataPokemonGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 32px 172px 174px 144px 144px 144px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }

  & .name {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.text100};
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  & .error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 32px 172px 158px;

    & span:nth-child(4),
    & span:nth-child(5),
    & span:nth-child(6) {
      display: none;
    }
  }
`;

const RenderPokemonContainer = styled(DataPokemonGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px 0 8px;
  margin: 0 -8px 0 -8px;

  & .icon {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }
`;

const TypeContainer = styled.span`
  display: flex;
  gap: 8px;
`;

const getFormWithCurrentType = (pokemon: StudioCreature, type: StudioType) =>
  pokemon.forms.find((form) => form.type1 === type.dbSymbol || form.type2 === type.dbSymbol) || pokemon.forms[0];

const RenderPokemon = ({ pokemon, type, state }: RenderMoveProps) => {
  const form = getFormWithCurrentType(pokemon, type);
  const { t } = useTranslation('database_types');
  const getCreatureName = useGetEntityNameText();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const { projectDataValues: abilities } = useProjectAbilities();
  const types = state.projectData.types;

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();
  const shortcutAbilityNavigation = useShortcutNavigation('abilities', 'ability', '/database/abilities/');

  const getAbilityNameByIndex = (index: number) => {
    if (!form.abilities[index]) return '---';
    if (abilities[form.abilities[index]]) return getAbilityName(abilities[form.abilities[index]]);

    return t('ability_deleted');
  };

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <ResourceImage
          imagePathInProject={pokemonIconPath(pokemon, form.form)}
          fallback={form.form === 0 ? undefined : pokemonIconPath(pokemon)}
          className="icon"
        />
      </span>
      <span
        onClick={isClickable ? () => shortcutPokemonNavigation(pokemon.dbSymbol, form.form) : undefined}
        className={`${isClickable ? 'clickable' : null} name`}
      >
        {getCreatureName(pokemon)}
      </span>
      <TypeContainer>
        <TypeCategory type={form.type1}>{getNameType(types, form.type1, state)}</TypeCategory>
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2, state)}</TypeCategory> : <span></span>}
      </TypeContainer>
      {[0, 1, 2].map((index) => {
        const ability = abilities[form.abilities[index]];
        return (
          <span
            key={index}
            onClick={isClickable && ability ? () => shortcutAbilityNavigation(ability.dbSymbol) : undefined}
            className={`${isClickable && ability ? 'clickable' : null} ${ability ? '' : 'error'}`}
          >
            {getAbilityNameByIndex(index)}
          </span>
        );
      })}
    </RenderPokemonContainer>
  );
};

const getAllPokemonWithCurrentType = (type: StudioType, state: State) => {
  return Object.values(state.projectData.pokemon)
    .filter((pokemon) => pokemon.forms.find((form) => form.type1 === type.dbSymbol || form.type2 === type.dbSymbol))
    .sort((a, b) => a.id - b.id);
};

export const TypePokemonTable = ({ type }: TypePokemonTableProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_types');
  const allPokemon = getAllPokemonWithCurrentType(type, state);

  return (
    <DataPokemonTable>
      <DataPokemonGrid gap="16px" className="header">
        <span></span>
        <span>{t('pokemon_pokemon')}</span>
        <span>{t('pokemon_types')}</span>
        <span>{t('pokemon_ability1')}</span>
        <span>{t('pokemon_ability2')}</span>
        <span>{t('pokemon_ability3')}</span>
      </DataPokemonGrid>
      {allPokemon.map((pokemon) => (
        <RenderPokemon key={`type-pokemon-${pokemon.dbSymbol}`} pokemon={pokemon} type={type} state={state} />
      ))}
    </DataPokemonTable>
  );
};
