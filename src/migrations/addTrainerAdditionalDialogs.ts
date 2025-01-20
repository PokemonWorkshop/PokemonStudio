import { IpcMainEvent } from 'electron';
import { deletePSDKDatFile } from './migrateUtils';
import { TRAINER_VALIDATOR, StudioTrainer, TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';
import fsPromise from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import { parseJSON } from '@utils/json/parse';
import fs from 'fs';
import { loadCSV, saveCSV } from '@utils/textManagement';

const PRE_MIGRATION_TRAINER_VALIDATOR = TRAINER_VALIDATOR.omit({ additionalDialogs: true });
type StudioTrainerDataBeforeMigration = z.infer<typeof PRE_MIGRATION_TRAINER_VALIDATOR>;

const initCSVAdditionalDialogs = async (projectPath: string) => {
  const csvPath = path.join(projectPath, 'Data/Text/Dialogs');
  if (fs.existsSync(path.join(csvPath, `${TRAINER_ADDITIONAL_DIALOGS_TEXT_ID}.csv`))) {
    throw new Error(`The file ${TRAINER_ADDITIONAL_DIALOGS_TEXT_ID}.csv already exists. Please rename your file.`);
  }

  const trainerNames = await loadCSV(path.join(csvPath, `${TRAINER_NAME_TEXT_ID}.csv`));
  const header = trainerNames[0];
  saveCSV(path.join(csvPath, `${TRAINER_ADDITIONAL_DIALOGS_TEXT_ID}.csv`), [header]);
};

const addAdditionalDialogs = (trainer: StudioTrainerDataBeforeMigration): StudioTrainer => {
  return {
    ...trainer,
    additionalDialogs: [],
  };
};

export const addTrainerAdditionalDialogs = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  await initCSVAdditionalDialogs(projectPath);

  const trainers = await readProjectFolder(projectPath, 'trainers');
  await trainers.reduce(async (lastPromise, trainer) => {
    await lastPromise;
    const trainerParsed = PRE_MIGRATION_TRAINER_VALIDATOR.safeParse(parseJSON(trainer.data, trainer.filename));
    if (trainerParsed.success) {
      const trainerUpdated = addAdditionalDialogs(trainerParsed.data);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/trainers', `${trainerUpdated.dbSymbol}.json`),
        JSON.stringify(trainerUpdated, null, 2)
      );
    }
  }, Promise.resolve());
};
