import fs from 'fs';
import { IpcMainEvent } from 'electron';
import path from 'path';
import { deletePSDKDatFile } from './migrateUtils';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { loadCSV, saveCSV } from '@utils/textManagement';

export const baseForEvents = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const eventsPath = path.join(projectPath, 'Data/Studio/events');
  fs.mkdirSync(eventsPath, { recursive: true });

  const csvPath = path.join(projectPath, 'Data/Text/Studio');
  const eventCsvPath = path.join(csvPath, `${EVENT_NAME_TEXT_ID}.csv`);
  if (fs.existsSync(eventCsvPath)) {
    throw new Error(`The file ${EVENT_NAME_TEXT_ID}.csv already exists. Please rename your file.`);
  }

  const textInfo = await loadCSV(path.join(csvPath, `${TEXT_INFO_NAME_TEXT_ID}.csv`));
  const eventNames = [textInfo[0], textInfo[1].map(() => 'Event 0')];

  saveCSV(eventCsvPath, eventNames);
};
