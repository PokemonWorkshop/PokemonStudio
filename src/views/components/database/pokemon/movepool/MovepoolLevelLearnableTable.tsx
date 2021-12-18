import React, { useMemo, useState } from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import { DataGrid } from '@components/database/dataBlocks';
import PokemonForm, { LevelLearnableMove } from '@modelEntities/pokemon/PokemonForm';
import { ProjectData, SelectedDataIdentifier } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Input } from '@components/inputs';
import { DeleteButtonOnlyIcon } from '@components/buttons';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData } from '@utils/useProjectData';
import PSDKEntity from '@modelEntities/PSDKEntity';
import { DataMoveTable, NoMoveFound } from './MovepoolTableStyle';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { getNameType } from '@utils/getNameType';

type RenderEditMoveProps = {
  learnableMove: LevelLearnableMove;
  index: number;
  moves: ProjectData['moves'];
  types: ProjectData['types'];
  pokemonIdentifier: PokemonIdentifierType;
  currentEditedPokemon: PokemonModel;
  setPokemon(newDataValues: Partial<{ [k: string]: PSDKEntity }>, newSelectedData?: Pick<SelectedDataIdentifier, 'pokemon'> | undefined): void;
  moveOptions: SelectOption[];
  occurrences: MoveOccurrenceType[];
};

type PokemonIdentifierType = {
  specie: string;
  form: number;
};

type MoveOccurrenceType = {
  move: { dbSymbol: string; level: number };
  occurrence: number;
};

const DataMoveGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 58px 280px 75px 75px 49px 87px 82px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;

    .delete {
      display: flex;
    }
  }

  & span:nth-child(5),
  & span:nth-child(6),
  & span:nth-child(7) {
    text-align: right;
  }

  .delete:nth-child(8) {
    display: none;
    justify-content: end;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 58px 252px auto;

    & span:nth-child(3),
    & span:nth-child(4),
    & span:nth-child(5),
    & span:nth-child(6),
    & span:nth-child(7) {
      display: none;
    }
  }
`;

const RenderMoveContainer = styled(DataMoveGrid)`
  box-sizing: border-box;
  height: 48px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;
`;

const getMoveOptions = (allMoves: ProjectData['moves']): SelectOption[] =>
  Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, label: moveData.name(), index: moveData.id }))
    .sort((a, b) => a.index - b.index);

const getOccurrences = (form: PokemonForm) => {
  const occurrences: MoveOccurrenceType[] = [];
  form.levelLearnableMove.map((levelLearnableMove) => {
    const occurrence = occurrences.find((dbs) => dbs.move.dbSymbol === levelLearnableMove.move && dbs.move.level === levelLearnableMove.level);
    if (occurrence) occurrence.occurrence += 1;
    else occurrences.push({ move: { dbSymbol: levelLearnableMove.move, level: levelLearnableMove.level }, occurrence: 1 });
  });
  return occurrences;
};

const editLevel = (index: number, pokemonIdentifier: PokemonIdentifierType, currentEditedPokemon: PokemonModel, level: number) => {
  const currentEditedForm = currentEditedPokemon.forms[pokemonIdentifier.form];
  currentEditedForm.levelLearnableMove[index].level = level;
  currentEditedForm.levelLearnableMove.sort((a, b) => a.level - b.level);
  return currentEditedPokemon;
};

const editMove = (index: number, pokemonIdentifier: PokemonIdentifierType, currentEditedPokemon: PokemonModel, move: string) => {
  currentEditedPokemon.forms[pokemonIdentifier.form].levelLearnableMove[index].move = move;
  return currentEditedPokemon;
};

const deleteMove = (index: number, pokemonIdentifier: PokemonIdentifierType, currentEditedPokemon: PokemonModel) => {
  currentEditedPokemon.forms[pokemonIdentifier.form].levelLearnableMove.splice(index, 1);
  return currentEditedPokemon;
};

const RenderEditMove = ({
  learnableMove,
  index,
  moves,
  types,
  pokemonIdentifier,
  currentEditedPokemon,
  setPokemon,
  moveOptions,
  occurrences,
}: RenderEditMoveProps) => {
  const { t } = useTranslation(['database_moves']);
  const move = moves[learnableMove.move];
  const [currentLevel, setCurrentLevel] = useState(learnableMove.level);

  return (
    <RenderMoveContainer gap="8px">
      <Input
        type="number"
        name="level"
        min="1"
        value={currentLevel}
        onChange={(event) => {
          const newValue = Number(event.target.value);
          if (newValue < 1) return event.preventDefault();
          setCurrentLevel(newValue);
        }}
        onBlur={(event) => {
          setCurrentLevel(Number(event.target.value));
          setPokemon({
            [pokemonIdentifier.specie]: editLevel(index, pokemonIdentifier, currentEditedPokemon, currentLevel),
          });
        }}
      />
      <SelectCustom
        options={moveOptions}
        onChange={(selected) => {
          setPokemon({
            [pokemonIdentifier.specie]: editMove(index, pokemonIdentifier, currentEditedPokemon, selected.value),
          });
        }}
        noOptionsText={t('database_moves:no_option')}
        value={{ value: learnableMove.move, label: move ? move.name() : t('database_moves:move_deleted') }}
        error={
          (occurrences.find((occ) => occ.move.dbSymbol === learnableMove.move && occ.move.level === learnableMove.level)?.occurrence || 1) > 1 ||
          !move
        }
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
              [pokemonIdentifier.specie]: deleteMove(index, pokemonIdentifier, currentEditedPokemon),
            })
          }
          disabled={currentEditedPokemon.forms[pokemonIdentifier.form].levelLearnableMove.length === 1}
        />
      </div>
    </RenderMoveContainer>
  );
};

export const MovepoolLevelLearnableTable = () => {
  const { projectDataValues: moves } = useProjectData('moves', 'move');
  const { projectDataValues: types } = useProjectData('types', 'type');
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setProjectDataValues: setPokemon,
  } = useProjectData('pokemon', 'pokemon');
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const currentEditedPokemon = pokemon[pokemonIdentifier.specie].clone();
  const moveOptions = useMemo(() => getMoveOptions(moves), [moves]);
  const movepool = currentEditedPokemon.forms[pokemonIdentifier.form].levelLearnableMove;
  const occurrences = getOccurrences(currentEditedPokemon.forms[pokemonIdentifier.form]);

  return movepool.length === 0 ? (
    <NoMoveFound>{t('database_moves:no_option')}</NoMoveFound>
  ) : (
    <DataMoveTable>
      <DataMoveGrid gap="8px" className="header">
        <span>{t('database_moves:level')}</span>
        <span>{t('database_pokemon:move')}</span>
        <span>{t('database_moves:type')}</span>
        <span>{t('database_moves:category')}</span>
        <span>{t('database_moves:pp')}</span>
        <span>{t('database_moves:power')}</span>
        <span>{t('database_moves:accuracy')}</span>
      </DataMoveGrid>
      {movepool.map((learnableMove, index) => (
        <RenderEditMove
          key={`level-learnable-${learnableMove.move}-${learnableMove.level}-${index}-${new Date().getTime()}`}
          learnableMove={learnableMove}
          index={index}
          moves={moves}
          types={types}
          pokemonIdentifier={pokemonIdentifier}
          currentEditedPokemon={currentEditedPokemon}
          setPokemon={setPokemon}
          moveOptions={moveOptions}
          occurrences={occurrences}
        />
      ))}
    </DataMoveTable>
  );
};
