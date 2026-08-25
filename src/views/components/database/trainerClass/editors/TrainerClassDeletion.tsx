import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useProjectTrainerClasses } from '@hooks/useProjectData';
import { getEntityNameText } from '@utils/ReadingProjectText';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type TrainerClassDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the trainer before doing so.
 */
export const TrainerClassDeletion = forwardRef<EditorHandlingClose, TrainerClassDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation();
  const {
    projectDataValues: trainerClasses,
    selectedDataIdentifier: dbSymbol,
    removeProjectDataValue: deleteTrainerClass,
    state,
  } = useProjectTrainerClasses();
  const trainerClass = trainerClasses[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trainerClassName = useMemo(() => getEntityNameText(trainerClass, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(trainerClasses)
      .map(([value, trainerClassData]) => ({ value, index: trainerClassData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    deleteTrainerClass(dbSymbol, { trainerClass: firstDbSymbol });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('trainer_class_deletion_of')}
      message={t('trainer_class_deletion_message', { trainerClass: trainerClassName.replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
TrainerClassDeletion.displayName = 'TrainerClassDeletion';
