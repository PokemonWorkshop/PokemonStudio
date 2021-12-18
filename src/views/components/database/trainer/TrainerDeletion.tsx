import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectPokemon, useProjectTrainers } from '@utils/useProjectData';

type TrainerDeletionProps = {
  type: 'trainer' | 'battler';
  battlerIndex?: number;
  onClose: () => void;
};

export const TrainerDeletion = ({ type, battlerIndex, onClose }: TrainerDeletionProps) => {
  const {
    projectDataValues: trainers,
    selectedDataIdentifier: trainerDbSymbol,
    setProjectDataValues: setTrainer,
    removeProjectDataValue: removeTrainer,
  } = useProjectTrainers();
  const { projectDataValues: species } = useProjectPokemon();
  const { t } = useTranslation('database_trainers');
  const trainer = trainers[trainerDbSymbol];
  const currentDeletedTrainer = useMemo(() => trainer.clone(), [trainer]);

  const onClickDelete = () => {
    if (type === 'trainer') {
      const firstDbSymbol = Object.entries(trainers)
        .map(([value, trainerData]) => ({ value, index: trainerData.id }))
        .filter((d) => d.value !== trainerDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      removeTrainer(trainerDbSymbol, { trainer: firstDbSymbol });
    } else if (type === 'battler' && battlerIndex !== undefined) {
      currentDeletedTrainer.party.splice(battlerIndex, 1);
      setTrainer({ [trainer.dbSymbol]: currentDeletedTrainer });
    }
    onClose();
  };

  return (
    <Deletion
      title={t(`${type}_deletion_of`)}
      message={t(`${type}_deletion_message`, {
        battler:
          battlerIndex !== undefined && species[trainer.party[battlerIndex].specie]
            ? species[trainer.party[battlerIndex].specie].name().replaceAll(' ', '\u00a0')
            : '???',
        trainer: trainer.trainerName().replaceAll(' ', '\u00a0'),
      })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
