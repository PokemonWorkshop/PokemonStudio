import { app, IpcMainEvent } from 'electron';
import log from 'electron-log';

const getStudioVersion = (event: IpcMainEvent) => {
  log.info('get-studio-version');
  try {
    log.info('get-studio-version/success', { studioVersion: app.getVersion() });
    return event.sender.send('get-studio-version/success', { studioVersion: app.getVersion() });
  } catch (error) {
    log.error('get-studio-version/failure', error);
    event.sender.send('get-studio-version/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registergetStudioVersion = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('get-studio-version', getStudioVersion);
};
