import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { ProjectText, projectTextKeys } from '@src/GlobalStateProvider';
import { parse } from 'csv-parse';

const loadCSV = async (textPath: string, id: keyof ProjectText): Promise<string[][]> => {
  const data: string[][] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(textPath, `${id}.csv`))
      .on('error', (err) => reject(`${id} ${err.message}`))
      .pipe(parse({ delimiter: ',' }))
      .on('data', (csvrow: string[]) => data.push(csvrow))
      .on('end', () => resolve(data));
  });
};

const readProjectTexts = async (event: IpcMainEvent, payload: { path: string }) => {
  log.info('read-project-texts');
  try {
    const projectTexts = await projectTextKeys.reduce(async (prev, curr, index) => {
      const previousResult = await prev;
      event.sender.send('read-project-texts/progress', { step: index + 1, total: projectTextKeys.length, stepText: `${curr}.csv` });
      const currentText = await loadCSV(path.join(payload.path, 'Data/Text/Dialogs'), curr);
      return { ...previousResult, [curr]: currentText };
    }, Promise.resolve({} as ProjectText));

    log.info('read-project-texts/success');
    event.sender.send('read-project-texts/success', projectTexts);
  } catch (error) {
    log.error('read-project-texts/failure', error);
    event.sender.send('read-project-texts/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadProjectTexts = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('read-project-texts', readProjectTexts);
};
