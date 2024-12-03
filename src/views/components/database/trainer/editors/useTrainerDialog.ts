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
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const dialogConditionEntries = (dialogs: TrainerDialogAdditionalDialogs[], dialogIndex: number, t: TFunction<'database_trainers'>) => {
  const currentConditions = dialogs.map(({ condition }) => condition).filter((condition) => condition !== dialogs[dialogIndex].condition);
  const conditions = TRAINER_ADDITIONAL_DIALOGS_CONDITION.filter((condition) => !currentConditions.includes(condition)).map((condition) => ({
    value: condition.toString(),
    label: t(`additional_dialog_${condition}`),
  }));
  return conditions;
};

export type TrainerDialogAdditionalDialogs = {
  condition: 'default' | StudioTrainerAdditionalDialogs['condition'];
  textId: number;
};

export const useTrainerDialog = () => {
  const { trainer, trainers } = useTrainerPage();
  const { t } = useTranslation('database_trainers');
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const allAdditionalDialogs = useMemo(() => getAllAdditionalDialogs(trainers, trainer), [trainers, trainer]);
  const [dialogIndex, setDialogIndex] = useState<number>(0);
  const [dialogs, setDialogs] = useState<TrainerDialogAdditionalDialogs[]>([
    {
      condition: 'default',
      textId: trainer.id,
    },
    ...trainer.additionalDialogs,
  ]);
  const [defaultSentence, setDefaultSentence] = useState(getText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, dialogs[dialogIndex].textId));
  const [conditionOptions, setConditionOptions] = useState(dialogConditionEntries(dialogs, dialogIndex, t));
  const currentDialog = dialogs[dialogIndex];

  const addDialog = () => {
    const newDialog = {
      condition: getNewCondition(dialogs),
      textId: getNewTextId(allAdditionalDialogs, dialogs),
    };
    const newIndex = dialogs.length;
    const newDialogs = [...dialogs, newDialog];
    setText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, newDialog.textId, '');
    setDialogs(newDialogs);
    setDialogIndex(newIndex);
    setDefaultSentence('');
    setConditionOptions(dialogConditionEntries(newDialogs, newIndex, t));
  };

  const deleteDialog = () => {
    if (currentDialog.condition === 'default') return;

    const index = dialogs.findIndex(({ condition }) => condition === currentDialog.condition);
    if (index === -1) return;

    const dialogsUpdated = cloneEntity(dialogs);
    dialogsUpdated.splice(index, 1);
    setDialogs(dialogsUpdated);
    updateDialogIndex(index - 1);
    setConditionOptions(dialogConditionEntries(dialogsUpdated, index - 1, t));
  };

  const changeCondition = (condition: string) => {
    const dialogsUpdated = cloneEntity(dialogs);
    dialogsUpdated[dialogIndex].condition = condition as TrainerAdditionalDialogsCondition;
    setDialogs(dialogsUpdated);
  };

  const updateDialogIndex = (newIndex: number) => {
    setDialogIndex(newIndex);
    setDefaultSentence(getText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, dialogs[newIndex].textId));
    setConditionOptions(dialogConditionEntries(dialogs, newIndex, t));
  };

  return {
    dialogs,
    currentDialog,
    dialogIndex,
    canAddDialog: dialogs.length < TRAINER_ADDITIONAL_DIALOGS_CONDITION.length + 1,
    defaultSentence,
    conditionOptions,
    updateDialogIndex,
    addDialog,
    deleteDialog,
    changeCondition,
  };
};
