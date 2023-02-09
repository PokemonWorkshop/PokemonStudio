import { shell, IpcMainEvent, IpcMain } from 'electron';
import log from 'electron-log';
import fs from 'fs';

const showItemInFolder = async (event: IpcMainEvent, payload: { filePath: string; extensions?: string[] }) => {
  log.info('show-item-folder');
  try {
    if (payload.extensions) {
      const isOpen = { value: false };
      payload.extensions.forEach((ext) => {
        const filepathWithExt = `${process.platform === 'win32' ? payload.filePath.replaceAll('/', '\\') : payload.filePath}${ext}`;
        if (!isOpen.value && fs.existsSync(filepathWithExt)) {
          shell.showItemInFolder(filepathWithExt);
          isOpen.value = true;
        }
      });
    } else {
      if (process.platform === 'win32') shell.showItemInFolder(payload.filePath.replaceAll('/', '\\'));
      else shell.showItemInFolder(payload.filePath);
    }
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
