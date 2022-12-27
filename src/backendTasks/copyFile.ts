import log from 'electron-log';
import Electron, { IpcMainEvent } from 'electron';
import fs from 'fs';

const copyFile = (event: IpcMainEvent, payload: { srcFile: string; destFile: string }) => {
  log.info('copy-file');
  try {
    const result = fs.existsSync(payload.srcFile);
    if (!result) return event.sender.send('copy-file/failure', { errorMessage: 'The source file does not exist.' });

    fs.copyFileSync(payload.srcFile, payload.destFile);
    log.info('copy-file/success', { ...payload });
    return event.sender.send('copy-file/success', {});
  } catch (error) {
    log.error('copy-file/failure', error);
    event.sender.send('copy-file/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerCopyFile = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('copy-file', copyFile);
};
