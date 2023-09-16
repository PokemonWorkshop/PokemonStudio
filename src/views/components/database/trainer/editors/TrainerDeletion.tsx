import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectTrainers } from '@utils/useProjectData';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

type TrainerDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the trainer before doing so.
 */
export const TrainerDeletion = forwardRef<EditorHandlingClose, TrainerDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_trainers');
  const { projectDataValues: trainers, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteTrainer, state } = useProjectTrainers();
  const trainer = trainers[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trainerName = useMemo(() => getEntityNameText(trainer, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(trainers)
      .map(([value, trainerData]) => ({ value, index: trainerData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    deleteTrainer(dbSymbol, { trainer: firstDbSymbol });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('trainer_deletion_of')}
      message={t('trainer_deletion_message', { trainer: trainerName.replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
TrainerDeletion.displayName = 'TrainerDeletion';
