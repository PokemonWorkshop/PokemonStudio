import React, { useMemo } from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import { ProjectData, SelectedDataIdentifier, useGlobalState } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { DeleteButtonOnlyIcon } from '@components/buttons';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData } from '@utils/useProjectData';
import { DataMoveGrid, DataMoveTable, NoMoveFound, RenderMoveContainer } from './MovepoolTableStyle';
import { getNameType } from '@utils/getNameType';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { getSelectDataOptionsOrderedById } from '@components/selects/SelectDataGeneric';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioCreature, StudioCreatureForm, StudioLearnableMove } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioTechItem } from '@modelEntities/item';
import { StudioMove } from '@modelEntities/move';

type RenderEditMoveProps = {
  learnableMove: StudioLearnableMove;
  index: number;
  moves: ProjectData['moves'];
  types: ProjectData['types'];
  pokemonIdentifier: PokemonIdentifierType;
  currentEditedPokemon: StudioCreature;
  setPokemon(newDataValues: Partial<{ [k: string]: StudioCreature }>, newSelectedData?: Pick<SelectedDataIdentifier, 'pokemon'> | undefined): void;
  movepoolType: MovepoolTableType;
  moveOptions: SelectOption[];
  occurrences: MoveOccurrenceType[];
  moveSet: StudioLearnableMove[];
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

const getSafeName = (
  move: StudioMove,
  t: TFunction<('database_pokemon' | 'database_moves')[]>,
  getEntityName: ReturnType<typeof useGetEntityNameText>
) => {
  if (move) return getEntityName(move);
  return t('database_moves:move_deleted');
};

const getMoveTechOptions = (
  allItems: ProjectData['items'],
  allMoves: ProjectData['moves'],
  t: TFunction<('database_pokemon' | 'database_moves')[]>,
  getEntityName: ReturnType<typeof useGetEntityNameText>
) =>
  Object.values(allItems)
    .filter((itemData): itemData is StudioTechItem => itemData.klass === 'TechItem')
    .map((itemData) => ({
      value: itemData.move,
      label: `${getEntityName(itemData)} - ${getSafeName(allMoves[itemData.move], t, getEntityName)}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));

export const getMoveKlass = (movepoolType: MovepoolTableType) => {
  switch (movepoolType) {
    case 'tutor':
      return 'TutorLearnableMove';
    case 'tech':
      return 'TechLearnableMove';
    case 'breed':
      return 'BreedLearnableMove';
    default:
      return 'EvolutionLearnableMove';
  }
};

const getMovepool = (form: StudioCreatureForm, movepoolType: MovepoolTableType) => {
  const klass = getMoveKlass(movepoolType);
  return form.moveSet.filter((m) => m.klass === klass);
};

const getMovepoolData = (
  type: MovepoolTableType,
  moves: ProjectData['moves'],
  items: ProjectData['items'],
  currentEditedForm: StudioCreatureForm,
  t: TFunction<('database_pokemon' | 'database_moves')[]>,
  getEntityName: ReturnType<typeof useGetEntityNameText>
) => {
  if (type === 'tech') {
    const techItems = Object.values(items).filter((itemData): itemData is StudioTechItem => itemData.klass === 'TechItem');
    return getMovepool(currentEditedForm, type).sort((a, b) => {
      const techItemA = techItems.filter((itemData) => itemData.move === a.move)[0];
      const techItemB = techItems.filter((itemData) => itemData.move === b.move)[0];
      const nameA = techItemA
        ? `${getEntityName(techItemA)} - ${getSafeName(moves[techItemA.move], t, getEntityName)}`
        : getSafeName(moves[a.move], t, getEntityName);
      const nameB = techItemB
        ? `${getEntityName(techItemB)} - ${getSafeName(moves[techItemB.move], t, getEntityName)}`
        : getSafeName(moves[b.move], t, getEntityName);
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
  return getMovepool(currentEditedForm, type).sort((a, b) =>
    getSafeName(moves[a.move], t, getEntityName).localeCompare(getSafeName(moves[b.move], t, getEntityName))
  );
};

const editMove = (index: number, moveSet: StudioLearnableMove[], currentEditedPokemon: StudioCreature, move: string) => {
  moveSet[index].move = move as DbSymbol;
  return currentEditedPokemon;
};

const deleteMove = (
  index: number,
  moveSet: StudioLearnableMove[],
  pokemonIdentifier: PokemonIdentifierType,
  currentEditedPokemon: StudioCreature,
  type: MovepoolTableType
) => {
  moveSet.splice(index, 1);
  const form = currentEditedPokemon.forms[pokemonIdentifier.form];
  const klass = getMoveKlass(type);
  form.moveSet = [...form.moveSet.filter((m) => m.klass !== klass), ...moveSet];
  return currentEditedPokemon;
};

const getOccurrences = (form: StudioCreatureForm, type: MovepoolTableType) => {
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
  moveSet,
}: RenderEditMoveProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const [state] = useGlobalState();
  const getEntityName = useGetEntityNameText();
  const move = moves[learnableMove.move];
  const value =
    movepoolType === 'tech'
      ? moveOptions.find((options) => options.value === learnableMove.move) || {
          value: learnableMove.move,
          label: getSafeName(move, t, getEntityName),
        }
      : {
          value: learnableMove.move,
          label: getSafeName(move, t, getEntityName),
        };

  return (
    <RenderMoveContainer gap="8px">
      <SelectCustom
        options={moveOptions}
        onChange={(selected) => {
          setPokemon({
            [pokemonIdentifier.specie]: editMove(index, moveSet, currentEditedPokemon, selected.value),
          });
        }}
        noOptionsText={t('database_moves:no_option')}
        value={value}
        error={(occurrences.find((occ) => occ.dbSymbol === learnableMove.move)?.occurrence || 1) > 1 || !move}
      />
      {move ? <TypeCategory type={move.type}>{getNameType(types, move.type, state)}</TypeCategory> : <TypeCategory type="normal">???</TypeCategory>}
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
              [pokemonIdentifier.specie]: deleteMove(index, moveSet, pokemonIdentifier, currentEditedPokemon, movepoolType),
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
    state,
  } = useProjectData('pokemon', 'pokemon');
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const getEntityName = useGetEntityNameText();
  const currentEditedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
  const form = useMemo(
    () => currentEditedPokemon.forms.find((form) => form.form === pokemonIdentifier.form) || currentEditedPokemon.forms[0],
    [currentEditedPokemon.forms, pokemonIdentifier.form]
  );
  const movepoolData = getMovepoolData(movepoolType, moves, items, form, t, getEntityName);
  const occurrences = getOccurrences(form, movepoolType);

  const moveOptions = useMemo(
    () =>
      movepoolType === 'tech'
        ? getMoveTechOptions(items, moves, t, getEntityName)
        : getSelectDataOptionsOrderedById(state.projectData, 'moves', getEntityName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movepoolType, state.projectData]
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
          moveSet={movepoolData}
        />
      ))}
    </DataMoveTable>
  );
};
