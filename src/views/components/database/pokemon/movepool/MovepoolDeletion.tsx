import React from 'react';
import { Deletion } from '@components/deletion';
import { useProjectMoves, useProjectPokemon } from '@utils/useProjectData';
import { ProjectData } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { MovepoolType } from './MovepoolEditor';

type MovepoolDeletionProps = {
  type: MovepoolType;
  onClose: () => void;
};

const getDefaultDbSymbol = (allMoves: ProjectData['moves']) => {
  if (Object.entries(allMoves).find(([value]) => value === 'splash')) return 'splash';
  return Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, index: moveData.id }))
    .sort((a, b) => a.index - b.index)[0].value;
};

export const MovepoolDeletion = ({ type, onClose }: MovepoolDeletionProps) => {
  const { projectDataValues: pokemon, selectedDataIdentifier: currentPokemon, setProjectDataValues: setPokemon } = useProjectPokemon();
  const { projectDataValues: moves } = useProjectMoves();
  const { t } = useTranslation(['database_pokemon']);

  const onClickDelete = () => {
    const currentEditedPokemon = pokemon[currentPokemon.specie].clone();
    const form = currentEditedPokemon.forms[currentPokemon.form];
    if (type === 'level') {
      form.levelLearnableMove = [];
      form.setLevelLearnableMove(getDefaultDbSymbol(moves), 1);
    }
    if (type === 'tutor') form.tutorLearnableMove = [];
    if (type === 'tech') form.techLearnableMove = [];
    if (type === 'breed') form.breedLearnableMove = [];
    if (type === 'evolution') form.evolutionLearnableMove = [];
    setPokemon({ [currentPokemon.specie]: currentEditedPokemon });
    onClose();
  };

  return (
    <Deletion
      title={t(`database_pokemon:movepool_deletion`)}
      message={t(`database_pokemon:movepool_deletion_message_${type}`, { pokemon: pokemon[currentPokemon.specie].name() })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
