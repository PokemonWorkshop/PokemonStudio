import { TypeCategory } from '@components/categories';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataGrid } from '../dataBlocks';
import { useProjectAbilities } from '@utils/useProjectData';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';
import { StudioAbility } from '@modelEntities/ability';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { pokemonIconPath } from '@utils/resourcePath';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { CONTROL, useKeyPress } from '@utils/useKeyPress';
import { usePokemonShortcutNavigation, useShortcutNavigation } from '@utils/useShortcutNavigation';

type AbilityPokemonTableProps = {
  ability: StudioAbility;
};

type RenderAbilityProps = {
  pokemon: StudioCreature;
  ability: StudioAbility;
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

const getFormWithCurrentAbility = (pokemon: StudioCreature, ability: StudioAbility): StudioCreatureForm =>
  pokemon.forms.find(
    (form) => form.abilities[0] === ability.dbSymbol || form.abilities[1] === ability.dbSymbol || form.abilities[2] === ability.dbSymbol
  ) || pokemon.forms[0];

const getAllPokemonWithCurrentAbility = (state: State, ability: StudioAbility): StudioCreature[] => {
  return (Object.values(state.projectData.pokemon) as unknown[] as StudioCreature[]) // TODO: Remove as - as
    .filter((pokemon) =>
      pokemon.forms.find(
        (form) => form.abilities[0] === ability.dbSymbol || form.abilities[1] === ability.dbSymbol || form.abilities[2] === ability.dbSymbol
      )
    )
    .sort((a, b) => a.id - b.id);
};

const RenderPokemon = ({ pokemon, ability, state }: RenderAbilityProps) => {
  const form: StudioCreatureForm = getFormWithCurrentAbility(pokemon, ability);
  const { projectDataValues: abilities } = useProjectAbilities();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const getCreatureName = useGetEntityNameText();
  const { t } = useTranslation('database_abilities');
  const types = state.projectData.types;

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();
  const shortcutAbilityNavigation = useShortcutNavigation('abilities', 'ability', '/database/abilities/');

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <ResourceImage
          imagePathInProject={pokemonIconPath(pokemon, form.form)}
          fallback={form.form === 0 ? undefined : pokemonIconPath(pokemon)}
          className="icon"
        />
      </span>
      <span className={isClickable ? 'clickable name' : 'name'} onClick={isClickable ? () => shortcutPokemonNavigation(pokemon.dbSymbol) : undefined}>
        {pokemon ? getCreatureName(pokemon) : '---'}
      </span>
      <TypeContainer>
        {form.type1 !== '__undef__' ? <TypeCategory type={form.type1}>{getNameType(types, form.type1, state)}</TypeCategory> : <span></span>}
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2, state)}</TypeCategory> : <span></span>}
      </TypeContainer>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`${abilities[form.abilities[index]] ? undefined : 'error'}, ${isClickable ? 'clickable' : undefined}`}
          onClick={isClickable ? () => shortcutAbilityNavigation(form.abilities[index]) : undefined}
        >
          {form.abilities[index]
            ? abilities[form.abilities[index]]
              ? getAbilityName(abilities[form.abilities[index]])
              : t('ability_deleted')
            : '---'}
        </span>
      ))}
    </RenderPokemonContainer>
  );
};

export const AbilityPokemonTable = ({ ability }: AbilityPokemonTableProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_abilities');
  const allPokemon = getAllPokemonWithCurrentAbility(state, ability);

  return (
    <DataPokemonTable>
      <DataPokemonGrid gap="16px" className="header">
        <span></span>
        <span>{t('pokemon_pokemon')}</span>
        <span>{t('pokemon_type')}</span>
        <span>{t('pokemon_ability1')}</span>
        <span>{t('pokemon_ability2')}</span>
        <span>{t('pokemon_ability3')}</span>
      </DataPokemonGrid>
      {allPokemon.map((pokemon) => (
        <RenderPokemon key={`ability-pokemon-${pokemon.dbSymbol}`} pokemon={pokemon} ability={ability} state={state} />
      ))}
    </DataPokemonTable>
  );
};
