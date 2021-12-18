import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';

const getProjectInfo = async (event: IpcMainEvent, payload: { path: string }) => {
  log.info('get-project-info', payload);
  try {
    const fileData = fs.readFileSync(path.join(payload.path, 'Data/configs/infos_config.json'));
    const data = JSON.parse(fileData.toString('utf-8'));
    log.info('get-project-info/success', data);
    event.sender.send('get-project-info/success', data);
  } catch (error) {
    log.error('get-project-info/failure', error);
    event.sender.send('get-project-info/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerGetProjectInfo = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('get-project-info', getProjectInfo);
};
