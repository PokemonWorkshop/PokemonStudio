import React from 'react';
import { Deletion } from '@components/deletion';
import { useProjectMoves, useProjectPokemon } from '@hooks/useProjectData';
import { ProjectData } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { MovepoolType } from './MovepoolEditor';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { getMoveKlass } from './MovepoolTable';
import { DbSymbol } from '@modelEntities/dbSymbol';

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
  const getCreatureName = useGetEntityNameText();
  const { t } = useTranslation(['database_pokemon']);

  const onClickDelete = () => {
    const currentEditedPokemon = cloneEntity(pokemon[currentPokemon.specie]);
    const form = currentEditedPokemon.forms.find((form) => form.form === currentPokemon.form) || currentEditedPokemon.forms[0];
    const klass = type === 'level' ? 'LevelLearnableMove' : getMoveKlass(type);
    form.moveSet = form.moveSet.filter((m) => m.klass !== klass);
    if (type === 'level') {
      form.moveSet.push({
        klass: 'LevelLearnableMove',
        move: getDefaultDbSymbol(moves) as DbSymbol,
        level: 1,
      });
    }
    setPokemon({ [currentPokemon.specie]: currentEditedPokemon });
    onClose();
  };

  return (
    <Deletion
      title={t(`database_pokemon:movepool_deletion`)}
      message={t(`database_pokemon:movepool_deletion_message_${type}`, { pokemon: getCreatureName(pokemon[currentPokemon.specie]) })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
