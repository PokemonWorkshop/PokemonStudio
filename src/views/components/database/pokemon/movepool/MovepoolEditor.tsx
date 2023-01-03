import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockCollapseEditor } from '@components/editor/DataBlockCollapseEditor';
import { useProjectPokemon, useProjectItems, useProjectMoves } from '@utils/useProjectData';
import { getMoveKlass, MovepoolTable } from './MovepoolTable';
import { MovepoolLevelLearnableTable } from './MovepoolLevelLearnableTable';
import { ProjectData } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioCreatureForm, StudioLevelLearnableMove, StudioTechLearnableMove } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioTechItem } from '@modelEntities/item';

export type MovepoolType = 'level' | 'tutor' | 'tech' | 'breed' | 'evolution';

type MovepoolEditorProps = {
  type: MovepoolType;
  setCurrentEditor: React.Dispatch<React.SetStateAction<string | undefined>>;
  setCurrentDeletion: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const getDefaultDbSymbol = (allMoves: ProjectData['moves']) => {
  if (Object.entries(allMoves).find(([value]) => value === 'splash')) return 'splash';
  return Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, index: moveData.id }))
    .sort((a, b) => a.index - b.index)[0].value;
};

const setLearnableMove = (form: StudioCreatureForm, movepoolType: MovepoolType, allItems: ProjectData['items'], allMoves: ProjectData['moves']) => {
  const defaultDbSymbol = getDefaultDbSymbol(allMoves) as DbSymbol;
  if (movepoolType === 'level') {
    const llm = form.moveSet.filter((m): m is StudioLevelLearnableMove => m.klass === 'LevelLearnableMove');
    form.moveSet.push({
      klass: 'LevelLearnableMove',
      move: defaultDbSymbol,
      level: llm.length === 0 ? 1 : llm[llm.length - 1].level + 1,
    });
  }
  if (movepoolType === 'tutor') form.moveSet.push({ klass: 'TutorLearnableMove', move: defaultDbSymbol });
  if (movepoolType === 'tech') {
    const dbSymbolMoveTechItems = Object.values(allItems)
      .filter((itemData): itemData is StudioTechItem => itemData.klass === 'TechItem')
      .map((itemData) => itemData.move);
    if (dbSymbolMoveTechItems.length === 0) {
      form.moveSet.push({ klass: 'TechLearnableMove', move: defaultDbSymbol });
      return;
    }
    const techLearnableDbSymbol = form.moveSet
      .filter((m): m is StudioTechLearnableMove => m.klass === 'TechLearnableMove')
      .map((techLearnableMove) => techLearnableMove.move);
    const dbSymbolToAdd = dbSymbolMoveTechItems.find((dbSymbol) => !techLearnableDbSymbol.includes(dbSymbol as DbSymbol)) as DbSymbol | undefined;
    form.moveSet.push({ klass: 'TechLearnableMove', move: dbSymbolToAdd ? dbSymbolToAdd : dbSymbolMoveTechItems[0] });
  }
  if (movepoolType === 'breed') form.moveSet.push({ klass: 'BreedLearnableMove', move: defaultDbSymbol });
  if (movepoolType === 'evolution') form.moveSet.push({ klass: 'EvolutionLearnableMove', move: defaultDbSymbol });
};

export const MovepoolEditor = ({ type, setCurrentEditor, setCurrentDeletion }: MovepoolEditorProps) => {
  const { projectDataValues: pokemon, selectedDataIdentifier: currentPokemon, setProjectDataValues: setPokemon } = useProjectPokemon();
  const { projectDataValues: items } = useProjectItems();
  const { projectDataValues: moves } = useProjectMoves();
  const { t } = useTranslation(['database_pokemon']);

  const onClickAdd = () => {
    const currentEditedPokemon = cloneEntity(pokemon[currentPokemon.specie]);
    setLearnableMove(currentEditedPokemon.forms[currentPokemon.form], type, items, moves);
    setPokemon({ [currentPokemon.specie]: currentEditedPokemon });
  };

  const disabledDeletion = () => {
    const form = pokemon[currentPokemon.specie].forms[currentPokemon.form];
    if (type === 'level') return form.moveSet.filter((m) => m.klass === 'LevelLearnableMove').length <= 1;

    const klass = getMoveKlass(type);
    return form.moveSet.filter((m) => m.klass === klass).length === 0;
  };

  return (
    <DataBlockCollapseEditor
      editorTitle="edit"
      title={t(`database_pokemon:${type}_learnable_moves`)}
      size="full"
      onClickDelete={() => setCurrentDeletion(type)}
      importation={{ label: t('database_pokemon:movepool_import'), onClick: () => setCurrentEditor(type) }}
      add={{ label: t('database_pokemon:add_move'), onClick: onClickAdd }}
      disabledDeletion={disabledDeletion()}
    >
      {type === 'level' ? <MovepoolLevelLearnableTable /> : <MovepoolTable movepoolType={type} />}
    </DataBlockCollapseEditor>
  );
};
