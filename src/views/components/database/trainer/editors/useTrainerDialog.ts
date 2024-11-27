import { StudioTrainerAdditionalDialogs, TRAINER_ADDITIONAL_DIALOGS_CONDITION, TrainerAdditionalDialogsCondition } from '@modelEntities/trainer';
import { useTrainerPage } from '@src/hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { useState } from 'react';

export type TrainerDialogAdditionalDialogs = {
  condition: 'default' | StudioTrainerAdditionalDialogs['condition'];
  textId: number;
};

export const useTrainerDialog = () => {
  const { trainer } = useTrainerPage();
  const [dialogIndex, setDialogIndex] = useState<number>(0);
  const [dialogs, setDialogs] = useState<TrainerDialogAdditionalDialogs[]>([
    {
      condition: 'default',
      textId: trainer.id,
    },
    ...trainer.additionalDialogs,
  ]);
  const currentDialog = dialogs[dialogIndex];

  const addDialog = () => {
    console.log('addDialog');
  };

  const deleteDialog = () => {
    console.log('deleteDialog');
  };

  const changeCondition = (condition: string) => {
    const dialogsUpdated = cloneEntity(dialogs);
    dialogsUpdated[dialogIndex].condition = condition as TrainerAdditionalDialogsCondition;
    setDialogs(dialogsUpdated);
  };

  return {
    dialogs,
    currentDialog,
    dialogCount: dialogs.length,
    dialogIndex,
    canAddDialog: dialogs.length < TRAINER_ADDITIONAL_DIALOGS_CONDITION.length + 1,
    setDialogIndex,
    addDialog,
    deleteDialog,
    changeCondition,
  };
};
