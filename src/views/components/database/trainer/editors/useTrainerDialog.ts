import {
  StudioTrainer,
  StudioTrainerAdditionalDialogs,
  TRAINER_ADDITIONAL_DIALOGS_CONDITION,
  TRAINER_ADDITIONAL_DIALOGS_TEXT_ID,
  TrainerAdditionalDialogsCondition,
} from '@modelEntities/trainer';
import { ProjectData } from '@src/GlobalStateProvider';
import { useTrainerPage } from '@src/hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { findFirstAvailableTextId } from '@utils/ModelUtils';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { useMemo, useState } from 'react';

const getNewCondition = (dialogs: TrainerDialogAdditionalDialogs[]) => {
  const currentConditions = dialogs.map(({ condition }) => condition);
  return TRAINER_ADDITIONAL_DIALOGS_CONDITION.filter((condition) => !currentConditions.includes(condition))[0];
};

// Get all additional dialogs without the current trainer
const getAllAdditionalDialogs = (trainersData: ProjectData['trainers'], currentTrainer: StudioTrainer) => {
  const trainersWithoutCurrentTrainer = Object.values(trainersData).filter((trainer) => trainer.dbSymbol !== currentTrainer.dbSymbol);
  return trainersWithoutCurrentTrainer.reduce<StudioTrainerAdditionalDialogs[]>((prev, curr) => [...prev, ...curr.additionalDialogs], []);
};

const getNewTextId = (additionalDialogs: StudioTrainerAdditionalDialogs[], dialogs: TrainerDialogAdditionalDialogs[]) => {
  const currentDialogs = dialogs.filter(({ condition }) => condition !== 'default') as StudioTrainerAdditionalDialogs[];
  const allAdditionalDialogs = [...additionalDialogs, ...currentDialogs];
  return findFirstAvailableTextId(allAdditionalDialogs);
};

export type TrainerDialogAdditionalDialogs = {
  condition: 'default' | StudioTrainerAdditionalDialogs['condition'];
  textId: number;
};

export const useTrainerDialog = () => {
  const { trainer, trainers } = useTrainerPage();
  const setText = useSetProjectText();
  const allAdditionalDialogs = useMemo(() => getAllAdditionalDialogs(trainers, trainer), [trainers, trainer]);
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
    const newDialog = {
      condition: getNewCondition(dialogs),
      textId: getNewTextId(allAdditionalDialogs, dialogs),
    };
    console.log(newDialog);
    // TODO: fix Unable to find text x in dialog file 100069 due to bad refresh
    setText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, newDialog.textId, '');
    setDialogs((dialogs) => [...dialogs, newDialog]);
    setDialogIndex(dialogs.length);
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
