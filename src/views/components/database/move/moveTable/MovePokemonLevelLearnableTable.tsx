import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import MoveModel from '@modelEntities/move/Move.model';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import styled from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';
import { MoveDataProps } from '../MoveDataPropsInterface';
import { useTranslation } from 'react-i18next';
import { TypeCategory } from '@components/categories';
import { DataPokemonTable, NoPokemonFound, TypeContainer } from './MovePokemonTableStyle';
import { getNameType } from '@utils/getNameType';

type RenderPokemonProps = {
  pokemon: PokemonModel;
  move: MoveModel;
  state: State;
};

const DataPokemonGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  padding: 4px 8px;
  grid-template-columns: 32px 140px 158px 60px auto;
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

  & span:nth-child(4) {
    text-align: right;
  }
`;

const RenderPokemonContainer = styled(DataPokemonGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px 0 8px;
  margin: 0 -8px 0 -8px;
`;

const getFormWithCurrentMove = (pokemon: PokemonModel, move: MoveModel) => {
  if (pokemon.forms.length === 1) return pokemon.forms[0];
  return pokemon.forms.find((form) => form.levelLearnableMove.find((llm) => llm.move === move.dbSymbol)) || pokemon.forms[0];
};

const RenderPokemon = ({ pokemon, move, state }: RenderPokemonProps) => {
  const form = getFormWithCurrentMove(pokemon, move);
  const types = state.projectData.types;

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <img src={pokemon.icon(state, form)} />
      </span>
      <span className="name">{pokemon.name()}</span>
      <TypeContainer>
        <TypeCategory type={form.type1}>{getNameType(types, form.type1)}</TypeCategory>
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2)}</TypeCategory> : <span></span>}
      </TypeContainer>
      <span>{form.levelLearnableMove.find((llm) => llm.move === move.dbSymbol)?.level}</span>
    </RenderPokemonContainer>
  );
};

export const MovePokemonLevelLearnableTable = ({ move }: MoveDataProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_types', 'database_moves', 'database_pokemon']);
  const allPokemon = move.getAllPokemonWithCurrentLevelLearnableMove(state).sort((a, b) => a.id - b.id);

  return allPokemon.length === 0 ? (
    <NoPokemonFound>{t('database_pokemon:no_option')}</NoPokemonFound>
  ) : (
    <DataPokemonTable>
      <DataPokemonGrid gap="16px" className="header">
        <span></span>
        <span>{t('database_types:pokemon_pokemon')}</span>
        <span>{t('database_types:pokemon_type')}</span>
        <span>{t('database_moves:level')}</span>
      </DataPokemonGrid>
      {allPokemon.map((pokemon) => (
        <RenderPokemon key={`type-pokemon-${pokemon.dbSymbol}`} pokemon={pokemon} move={move} state={state} />
      ))}
    </DataPokemonTable>
  );
};
