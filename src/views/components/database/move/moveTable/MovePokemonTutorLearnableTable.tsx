import PokemonModel, { pokemonIconPath } from '@modelEntities/pokemon/Pokemon.model';
import MoveModel from '@modelEntities/move/Move.model';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { MoveDataProps } from '../MoveDataPropsInterface';
import { useTranslation } from 'react-i18next';
import { TypeCategory } from '@components/categories';
import { DataPokemonGrid, DataPokemonTable, NoPokemonFound, RenderPokemonContainer, TypeContainer } from './MovePokemonTableStyle';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';

type RenderPokemonProps = {
  pokemon: PokemonModel;
  move: MoveModel;
  state: State;
};

const getFormWithCurrentMove = (pokemon: PokemonModel, move: MoveModel) => {
  if (pokemon.forms.length === 1) return pokemon.forms[0];
  return pokemon.forms.find((form) => form.tutorLearnableMove.find((tlm) => tlm.move === move.dbSymbol)) || pokemon.forms[0];
};

const RenderPokemon = ({ pokemon, move, state }: RenderPokemonProps) => {
  const form = getFormWithCurrentMove(pokemon, move);
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
    </RenderPokemonContainer>
  );
};

export const MovePokemonTutorLearnableTable = ({ move }: MoveDataProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_types', 'database_moves', 'database_pokemon']);
  const allPokemon = move.getAllPokemonWithCurrentTutorLearnableMove(state).sort((a, b) => a.id - b.id);

  return allPokemon.length === 0 ? (
    <NoPokemonFound>{t('database_pokemon:no_option')}</NoPokemonFound>
  ) : (
    <DataPokemonTable>
      <DataPokemonGrid gap="16px" className="header">
        <span></span>
        <span>{t('database_types:pokemon_pokemon')}</span>
        <span>{t('database_types:pokemon_type')}</span>
      </DataPokemonGrid>
      {allPokemon.map((pokemon) => (
        <RenderPokemon key={`type-pokemon-${pokemon.dbSymbol}`} pokemon={pokemon} move={move} state={state} />
      ))}
    </DataPokemonTable>
  );
};
