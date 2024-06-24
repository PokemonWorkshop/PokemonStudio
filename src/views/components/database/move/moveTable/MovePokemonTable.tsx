import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TypeCategory } from '@components/categories';
import { DataPokemonGrid, DataPokemonTable, NoPokemonFound, RenderPokemonContainer, TypeContainer } from './MovePokemonTableStyle';
import { getNameType } from '@utils/getNameType';
import { ResourceImage } from '@components/ResourceImage';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { pokemonIconPath } from '@utils/path';
import { StudioCreature, StudioLevelLearnableMove } from '@modelEntities/creature';
import { StudioMove } from '@modelEntities/move';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation } from '@hooks/useShortcutNavigation';

export type FilterType = 'LevelLearnableMove' | 'TutorLearnableMove' | 'TechLearnableMove' | 'BreedLearnableMove' | 'EvolutionLearnableMove';

type MovePokemonTableProps = {
  move: StudioMove;
  filter: FilterType;
};

const getAllPokemonFiltered = (state: State, move: StudioMove, filter: FilterType) => {
  return Object.values(state.projectData.pokemon).filter((pokemon) =>
    pokemon.forms.find((form) => form.moveSet.find((m) => m.klass === filter && m.move === move.dbSymbol))
  );
};

export const MovePokemonTable = ({ move, filter }: MovePokemonTableProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_types', 'database_moves', 'database_pokemon']);
  const allPokemon = getAllPokemonFiltered(state, move, filter).sort((a, b) => a.id - b.id);

  return allPokemon.length === 0 ? (
    <NoPokemonFound>{t('database_pokemon:no_option')}</NoPokemonFound>
  ) : (
    <DataPokemonTable>
      <DataPokemonGrid gap="16px" className="header">
        <span></span>
        <span>{t('database_types:pokemon_pokemon')}</span>
        <span>{t('database_types:pokemon_type')}</span>
        {filter === 'LevelLearnableMove' && <span>{t('database_moves:level')}</span>}
      </DataPokemonGrid>
      {allPokemon.map((pokemon) => (
        <RenderPokemon key={`type-pokemon-${pokemon.dbSymbol}`} pokemon={pokemon} move={move} state={state} filter={filter} />
      ))}
    </DataPokemonTable>
  );
};

type RenderPokemonProps = {
  pokemon: StudioCreature;
  move: StudioMove;
  state: State;
  filter: FilterType;
};

const getFormWithCurrentMove = (pokemon: StudioCreature, move: StudioMove, filter: FilterType) => {
  if (pokemon.forms.length === 1) return pokemon.forms[0];
  return pokemon.forms.find((form) => form.moveSet.find((m) => m.klass === filter && m.move === move.dbSymbol)) || pokemon.forms[0];
};

const RenderPokemon = ({ pokemon, move, state, filter }: RenderPokemonProps) => {
  const form = getFormWithCurrentMove(pokemon, move, filter);
  const getCreatureName = useGetEntityNameText();
  const types = state.projectData.types;
  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutNavigation = usePokemonShortcutNavigation();

  return (
    <RenderPokemonContainer gap="16px">
      <span>
        <ResourceImage
          imagePathInProject={pokemonIconPath(pokemon, form.form)}
          fallback={form.form === 0 ? undefined : pokemonIconPath(pokemon)}
          className="icon"
        />
      </span>
      <span className={isClickable ? 'clickable name' : 'name'} onClick={isClickable ? () => shortcutNavigation(pokemon.dbSymbol) : undefined}>
        {getCreatureName(pokemon)}
      </span>
      <TypeContainer>
        <TypeCategory type={form.type1}>{getNameType(types, form.type1, state)}</TypeCategory>
        {form.type2 !== '__undef__' ? <TypeCategory type={form.type2}>{getNameType(types, form.type2, state)}</TypeCategory> : <span></span>}
      </TypeContainer>
      {/* only for LevelLearnableMove */}
      {filter === 'LevelLearnableMove' && (
        <span>
          {form.moveSet.filter((m): m is StudioLevelLearnableMove => m.klass === 'LevelLearnableMove').find((m) => m.move === move.dbSymbol)?.level}
        </span>
      )}
    </RenderPokemonContainer>
  );
};
