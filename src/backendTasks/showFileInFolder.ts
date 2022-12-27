import { shell, IpcMainEvent, IpcMain } from 'electron';
import log from 'electron-log';

const showItemInFolder = async (event: IpcMainEvent, payload: { filePath: string }) => {
  log.info('show-item-folder');
  try {
    if (process.platform === 'win32') shell.showItemInFolder(payload.filePath.replaceAll('/', '\\'));
    else shell.showItemInFolder(payload.filePath);
    log.info('show-item-folder/success', {});
    event.sender.send('show-item-folder/success', {});
  } catch (error) {
    log.error('show-item-folder/failure', error);
    event.sender.send('show-item-folder/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerShowItemInFolder = (ipcMain: IpcMain) => {
  ipcMain.on('show-item-folder', showItemInFolder);
};
