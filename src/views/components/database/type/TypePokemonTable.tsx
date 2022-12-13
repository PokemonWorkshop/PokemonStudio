import { TypeCategory } from '@components/categories';
import PokemonModel, { pokemonIconPath } from '@modelEntities/pokemon/Pokemon.model';
import TypeModel from '@modelEntities/type/Type.model';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataGrid } from '../dataBlocks';
import { useProjectAbilities } from '@utils/useProjectData';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';

type TypePokemonTableProps = {
  type: TypeModel;
};

type RenderMoveProps = {
  pokemon: PokemonModel;
  type: TypeModel;
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
`;

const TypeContainer = styled.span`
  display: flex;
  gap: 8px;
`;

const getFormWithCurrentType = (pokemon: PokemonModel, type: TypeModel) =>
  pokemon.forms.find((form) => form.type1 === type.dbSymbol || form.type2 === type.dbSymbol) || pokemon.forms[0];

const RenderPokemon = ({ pokemon, type, state }: RenderMoveProps) => {
  const form = getFormWithCurrentType(pokemon, type);
  const { t } = useTranslation('database_types');
  const { projectDataValues: abilities } = useProjectAbilities();
  const types = state.projectData.types;

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <ResourceImage imagePathInProject={pokemonIconPath(pokemon, form.form)} fallback={form.form === 0 ? undefined : pokemonIconPath(pokemon)} />
      </span>
      <span className="name">{pokemon.name()}</span>
      <TypeContainer>
        <TypeCategory type={form.type1}>{getNameType(types, form.type1)}</TypeCategory>
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2)}</TypeCategory> : <span></span>}
      </TypeContainer>
      <span className={abilities[form.abilities[0]] ? '' : 'error'}>
        {form.abilities[0] ? (abilities[form.abilities[0]] ? abilities[form.abilities[0]].name() : t('ability_deleted')) : '---'}
      </span>
      <span className={abilities[form.abilities[1]] ? '' : 'error'}>
        {form.abilities[1] ? (abilities[form.abilities[1]] ? abilities[form.abilities[1]].name() : t('ability_deleted')) : '---'}
      </span>
      <span className={abilities[form.abilities[2]] ? '' : 'error'}>
        {form.abilities[2] ? (abilities[form.abilities[2]] ? abilities[form.abilities[2]].name() : t('ability_deleted')) : '---'}
      </span>
    </RenderPokemonContainer>
  );
};

export const TypePokemonTable = ({ type }: TypePokemonTableProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_types');
  const allPokemon = type.getAllPokemonWithCurrentType(state);

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
