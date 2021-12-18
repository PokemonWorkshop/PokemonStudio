import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockCollapseEditor } from '@components/editor/DataBlockCollapseEditor';
import { useProjectPokemon, useProjectItems, useProjectMoves } from '@utils/useProjectData';
import { MovepoolTable } from './MovepoolTable';
import PokemonForm from '@modelEntities/pokemon/PokemonForm';
import { MovepoolLevelLearnableTable } from './MovepoolLevelLearnableTable';
import { ProjectData } from '@src/GlobalStateProvider';
import TechItemModel from '@modelEntities/item/TechItem.model';

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

const setLearnableMove = (form: PokemonForm, movepoolType: MovepoolType, allItems: ProjectData['items'], allMoves: ProjectData['moves']) => {
  const defaultDbSymbol = getDefaultDbSymbol(allMoves);
  if (movepoolType === 'level')
    form.setLevelLearnableMove(
      defaultDbSymbol,
      form.levelLearnableMove.length === 0 ? 1 : form.levelLearnableMove[form.levelLearnableMove.length - 1].level + 1
    );
  if (movepoolType === 'tutor') form.setTutorLearnableMove(defaultDbSymbol);
  if (movepoolType === 'tech') {
    const dbSymbolMoveTechItems = Object.entries(allItems)
      .filter(([, itemData]) => itemData.klass === 'TechItem')
      .map(([, techData]) => (techData as TechItemModel).move);
    if (dbSymbolMoveTechItems.length === 0) return form.setTechLearnableMove(defaultDbSymbol);
    const techLearnableDbSymbol = form.techLearnableMove.map((techLearnableMove) => techLearnableMove.move);
    const dbSymbolToAdd = dbSymbolMoveTechItems.find((dbSymbol) => !techLearnableDbSymbol.includes(dbSymbol));
    if (dbSymbolToAdd) form.setTechLearnableMove(dbSymbolToAdd);
    else form.setTechLearnableMove(dbSymbolMoveTechItems[0]);
  }
  if (movepoolType === 'breed') form.setBreedLearnableMove(defaultDbSymbol);
  if (movepoolType === 'evolution') form.setEvolutionLearnableMove(defaultDbSymbol);
};

export const MovepoolEditor = ({ type, setCurrentEditor, setCurrentDeletion }: MovepoolEditorProps) => {
  const { projectDataValues: pokemon, selectedDataIdentifier: currentPokemon, setProjectDataValues: setPokemon } = useProjectPokemon();
  const { projectDataValues: items } = useProjectItems();
  const { projectDataValues: moves } = useProjectMoves();
  const { t } = useTranslation(['database_pokemon']);

  const onClickAdd = () => {
    const currentEditedPokemon = pokemon[currentPokemon.specie].clone();
    setLearnableMove(currentEditedPokemon.forms[currentPokemon.form], type, items, moves);
    setPokemon({ [currentPokemon.specie]: currentEditedPokemon });
  };

  const disabledDeletion = () => {
    const form = pokemon[currentPokemon.specie].forms[currentPokemon.form];
    if (type === 'level') return form.levelLearnableMove.length <= 1;
    else if (type === 'tutor') return form.tutorLearnableMove.length === 0;
    else if (type === 'tech') return form.techLearnableMove.length === 0;
    else if (type === 'breed') return form.breedLearnableMove.length === 0;
    return form.evolutionLearnableMove.length === 0;
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
