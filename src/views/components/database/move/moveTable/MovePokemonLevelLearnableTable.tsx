import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import styled from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';
import { MoveDataProps } from '../MoveDataPropsInterface';
import { useTranslation } from 'react-i18next';
import { TypeCategory } from '@components/categories';
import { DataPokemonTable, NoPokemonFound, TypeContainer } from './MovePokemonTableStyle';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { pokemonIconPath } from '@utils/path';
import { StudioCreature, StudioLevelLearnableMove } from '@modelEntities/creature';
import { StudioMove } from '@modelEntities/move';

type RenderPokemonProps = {
  pokemon: StudioCreature;
  move: StudioMove;
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

  & .icon {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }
`;

const getFormWithCurrentMove = (pokemon: StudioCreature, move: StudioMove) => {
  if (pokemon.forms.length === 1) return pokemon.forms[0];
  return pokemon.forms.find((form) => form.moveSet.find((m) => m.klass === 'LevelLearnableMove' && m.move === move.dbSymbol)) || pokemon.forms[0];
};

const RenderPokemon = ({ pokemon, move, state }: RenderPokemonProps) => {
  const form = getFormWithCurrentMove(pokemon, move);
  const getCreatureName = useGetEntityNameText();
  const types = state.projectData.types;

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <ResourceImage
          imagePathInProject={pokemonIconPath(pokemon, form.form)}
          fallback={form.form === 0 ? undefined : pokemonIconPath(pokemon)}
          className="icon"
        />
      </span>
      <span className="name">{getCreatureName(pokemon)}</span>
      <TypeContainer>
        <TypeCategory type={form.type1}>{getNameType(types, form.type1, state)}</TypeCategory>
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2, state)}</TypeCategory> : <span></span>}
      </TypeContainer>
      <span>
        {form.moveSet.filter((m): m is StudioLevelLearnableMove => m.klass === 'LevelLearnableMove').find((m) => m.move === move.dbSymbol)?.level}
      </span>
    </RenderPokemonContainer>
  );
};

const getAllPokemonWithCurrentLevelLearnableMove = (state: State, move: StudioMove) => {
  return Object.values(state.projectData.pokemon).filter((pokemon) =>
    pokemon.forms.find((form) => form.moveSet.find((m) => m.klass === 'LevelLearnableMove' && m.move === move.dbSymbol))
  );
};

export const MovePokemonLevelLearnableTable = ({ move }: MoveDataProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_types', 'database_moves', 'database_pokemon']);
  const allPokemon = getAllPokemonWithCurrentLevelLearnableMove(state, move).sort((a, b) => a.id - b.id);

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
