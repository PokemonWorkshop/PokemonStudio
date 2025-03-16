import { IpcMainEvent } from 'electron';
import { deletePSDKDatFile } from './migrateUtils';
import path from 'path';
import fs from 'fs';
import { QUEST_CUSTOM_OBJECTIVE_TEXT_ID, QUEST_NAME_TEXT_ID } from '@modelEntities/quest';
import { loadCSV, saveCSV } from '@utils/textManagement';

export const addCsvForQuestsCustomObjectives = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const dialogsPath = path.join(projectPath, 'Data/Text/Dialogs');
  const csvCustomObjectivePath = path.join(dialogsPath, `${QUEST_CUSTOM_OBJECTIVE_TEXT_ID}.csv`);
  const questNames = await loadCSV(path.join(dialogsPath, `${QUEST_NAME_TEXT_ID}.csv`));
  if (fs.existsSync(csvCustomObjectivePath)) {
    throw new Error(`The file ${QUEST_CUSTOM_OBJECTIVE_TEXT_ID}.csv already exists. Please rename your file.`);
  }

  const header = questNames[0]; // languages: fr, en, etc.
  saveCSV(path.join(csvCustomObjectivePath), [header]);
};
