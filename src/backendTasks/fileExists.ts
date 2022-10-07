import log from 'electron-log';
import Electron, { IpcMainEvent } from 'electron';
import fs from 'fs';

const fileExists = (event: IpcMainEvent, payload: { filePath: string }) => {
  log.info('file-exists-v2');
  try {
    const result = fs.existsSync(payload.filePath);
    log.info('file-exists-v2/success', { result });
    return event.sender.send('file-exists-v2/success', { result });
  } catch (error) {
    log.error('file-exists-v2/failure', error);
    event.sender.send('file-exists-v2/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerFileExists = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('file-exists-v2', fileExists);
};
