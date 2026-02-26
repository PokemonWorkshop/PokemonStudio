import { IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { EVENT_FOLDER_NAME_TEXT_ID } from '@modelEntities/event/event-tree';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { deletePSDKDatFile } from './migrateUtils';
import { loadCSV, saveCSV } from '@utils/textManagement';

export const addCsvForEventFolders = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const csvPath = path.join(projectPath, 'Data/Text/Studio');
  const eventFolderCsvPath = path.join(csvPath, `${EVENT_FOLDER_NAME_TEXT_ID}.csv`);

  if (fs.existsSync(eventFolderCsvPath)) {
    throw new Error(`The file ${EVENT_FOLDER_NAME_TEXT_ID}.csv already exists. Please rename your file.`);
  }

  const eventNames = await loadCSV(path.join(csvPath, `${EVENT_NAME_TEXT_ID}.csv`));
  const header = eventNames[0];

  saveCSV(eventFolderCsvPath, [header]);
};
