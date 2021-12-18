import React, { useMemo } from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import PokemonForm, { LearnableMove } from '@modelEntities/pokemon/PokemonForm';
import { ProjectData, SelectedDataIdentifier } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { DeleteButtonOnlyIcon } from '@components/buttons';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData } from '@utils/useProjectData';
import PSDKEntity from '@modelEntities/PSDKEntity';
import { DataMoveGrid, DataMoveTable, NoMoveFound, RenderMoveContainer } from './MovepoolTableStyle';
import TechItemModel from '@modelEntities/item/TechItem.model';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import MoveModel from '@modelEntities/move/Move.model';
import { getNameType } from '@utils/getNameType';

type RenderEditMoveProps = {
  learnableMove: LearnableMove;
  index: number;
  moves: ProjectData['moves'];
  types: ProjectData['types'];
  pokemonIdentifier: PokemonIdentifierType;
  currentEditedPokemon: PokemonModel;
  setPokemon(newDataValues: Partial<{ [k: string]: PSDKEntity }>, newSelectedData?: Pick<SelectedDataIdentifier, 'pokemon'> | undefined): void;
  movepoolType: MovepoolTableType;
  moveOptions: SelectOption[];
  occurrences: MoveOccurrenceType[];
};

type PokemonIdentifierType = {
  specie: string;
  form: number;
};

type MovepoolTableType = 'tutor' | 'tech' | 'breed' | 'evolution';

type MovepoolTableProps = {
  movepoolType: MovepoolTableType;
};

type MoveOccurrenceType = {
  dbSymbol: string;
  occurrence: number;
};

const getSafeName = (move: MoveModel, t: TFunction<('database_pokemon' | 'database_moves')[]>) => {
  if (move) return move.name();
  return t('database_moves:move_deleted');
};

const getMoveOptions = (allMoves: ProjectData['moves']): SelectOption[] =>
  Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, label: moveData.name(), index: moveData.id }))
    .sort((a, b) => a.index - b.index);

const getMoveTechOptions = (
  allItems: ProjectData['items'],
  allMoves: ProjectData['moves'],
  t: TFunction<('database_pokemon' | 'database_moves')[]>
): SelectOption[] =>
  Object.entries(allItems)
    .filter(([, itemData]) => itemData.klass === 'TechItem')
    .map(([, itemData]) => ({
      value: (itemData as TechItemModel).move,
      label: `${itemData.name()} - ${getSafeName(allMoves[(itemData as TechItemModel).move], t)}`,
      index: itemData.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));

const getMovepool = (form: PokemonForm, movepoolType: MovepoolTableType) => {
  if (movepoolType === 'tutor') return form.tutorLearnableMove;
  if (movepoolType === 'tech') return form.techLearnableMove;
  if (movepoolType === 'breed') return form.breedLearnableMove;
  return form.evolutionLearnableMove;
};

const getMovepoolData = (
  type: MovepoolTableType,
  moves: ProjectData['moves'],
  items: ProjectData['items'],
  currentEditedForm: PokemonForm,
  t: TFunction<('database_pokemon' | 'database_moves')[]>
) => {
  if (type === 'tech') {
    const techItems = Object.entries(items).filter(([, itemData]) => itemData.klass === 'TechItem');
    return getMovepool(currentEditedForm, type).sort((a, b) => {
      const techItemA = techItems
        .filter(([, itemData]) => (itemData as TechItemModel).move === a.move)
        .map(([, itemData]) => itemData as TechItemModel)[0];
      const techItemB = techItems
        .filter(([, itemData]) => (itemData as TechItemModel).move === b.move)
        .map(([, itemData]) => itemData as TechItemModel)[0];
      const nameA = techItemA ? `${techItemA.name()} - ${getSafeName(moves[techItemA.move], t)}` : getSafeName(moves[a.move], t);
      const nameB = techItemB ? `${techItemB.name()} - ${getSafeName(moves[techItemB.move], t)}` : getSafeName(moves[b.move], t);
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
  return getMovepool(currentEditedForm, type).sort((a, b) => getSafeName(moves[a.move], t).localeCompare(getSafeName(moves[b.move], t)));
};

const editMove = (
  index: number,
  pokemonIdentifier: PokemonIdentifierType,
  currentEditedPokemon: PokemonModel,
  move: string,
  type: MovepoolTableType
) => {
  getMovepool(currentEditedPokemon.forms[pokemonIdentifier.form], type)[index].move = move;
  return currentEditedPokemon;
};

const deleteMove = (index: number, pokemonIdentifier: PokemonIdentifierType, currentEditedPokemon: PokemonModel, type: MovepoolTableType) => {
  getMovepool(currentEditedPokemon.forms[pokemonIdentifier.form], type).splice(index, 1);
  return currentEditedPokemon;
};

const getOccurrences = (form: PokemonForm, type: MovepoolTableType) => {
  const occurences: MoveOccurrenceType[] = [];
  getMovepool(form, type).map((learnableMove) => {
    const occurrence = occurences.find((dbs) => dbs.dbSymbol === learnableMove.move);
    if (occurrence) occurrence.occurrence += 1;
    else occurences.push({ dbSymbol: learnableMove.move, occurrence: 1 });
  });
  return occurences;
};

const RenderEditMove = ({
  learnableMove,
  index,
  moves,
  types,
  pokemonIdentifier,
  currentEditedPokemon,
  setPokemon,
  movepoolType,
  moveOptions,
  occurrences,
}: RenderEditMoveProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const move = moves[learnableMove.move];
  const value =
    movepoolType === 'tech'
      ? moveOptions.find((options) => options.value === learnableMove.move) || {
          value: learnableMove.move,
          label: getSafeName(move, t),
        }
      : {
          value: learnableMove.move,
          label: getSafeName(move, t),
        };

  return (
    <RenderMoveContainer gap="8px">
      <SelectCustom
        options={moveOptions}
        onChange={(selected) => {
          setPokemon({
            [pokemonIdentifier.specie]: editMove(index, pokemonIdentifier, currentEditedPokemon, selected.value, movepoolType),
          });
        }}
        noOptionsText={t('database_moves:no_option')}
        value={value}
        error={(occurrences.find((occ) => occ.dbSymbol === learnableMove.move)?.occurrence || 1) > 1 || !move}
      />
      {move ? <TypeCategory type={move.type}>{getNameType(types, move.type)}</TypeCategory> : <TypeCategory type="normal">???</TypeCategory>}
      {move ? (
        <MoveCategory category={move.category}>{t(`database_moves:${move.category}` as never)}</MoveCategory>
      ) : (
        <MoveCategory category="physical">???</MoveCategory>
      )}
      <span>{move ? move.pp : '---'}</span>
      <span>{move ? move.power : '---'}</span>
      <span>{move ? move.accuracy : '---'}</span>
      <div className="delete">
        <DeleteButtonOnlyIcon
          onClick={() =>
            setPokemon({
              [pokemonIdentifier.specie]: deleteMove(index, pokemonIdentifier, currentEditedPokemon, movepoolType),
            })
          }
        />
      </div>
    </RenderMoveContainer>
  );
};

export const MovepoolTable = ({ movepoolType }: MovepoolTableProps) => {
  const { projectDataValues: moves } = useProjectData('moves', 'move');
  const { projectDataValues: types } = useProjectData('types', 'type');
  const { projectDataValues: items } = useProjectData('items', 'item');
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setProjectDataValues: setPokemon,
  } = useProjectData('pokemon', 'pokemon');
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const currentEditedPokemon = pokemon[pokemonIdentifier.specie].clone();
  const movepoolData = getMovepoolData(movepoolType, moves, items, currentEditedPokemon.forms[pokemonIdentifier.form], t);
  const occurrences = getOccurrences(currentEditedPokemon.forms[pokemonIdentifier.form], movepoolType);

  const moveOptions = useMemo(
    () => (movepoolType === 'tech' ? getMoveTechOptions(items, moves, t) : getMoveOptions(moves)),
    [items, movepoolType, moves, t]
  );

  return movepoolData.length === 0 ? (
    <NoMoveFound>{t('database_moves:no_option')}</NoMoveFound>
  ) : (
    <DataMoveTable>
      <DataMoveGrid gap="8px" className="header">
        <span>{t('database_pokemon:move')}</span>
        <span>{t('database_moves:type')}</span>
        <span>{t('database_moves:category')}</span>
        <span>{t('database_moves:pp')}</span>
        <span>{t('database_moves:power')}</span>
        <span>{t('database_moves:accuracy')}</span>
      </DataMoveGrid>
      {movepoolData.map((learnableMove, index) => (
        <RenderEditMove
          key={`level-learnable-${learnableMove.move}-${index}`}
          learnableMove={learnableMove}
          index={index}
          moves={moves}
          types={types}
          pokemonIdentifier={pokemonIdentifier}
          currentEditedPokemon={currentEditedPokemon}
          setPokemon={setPokemon}
          movepoolType={movepoolType}
          moveOptions={moveOptions}
          occurrences={occurrences}
        />
      ))}
    </DataMoveTable>
  );
};
