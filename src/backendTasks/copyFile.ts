import log from 'electron-log';
import Electron, { BrowserWindow, dialog, IpcMainEvent } from 'electron';
import fs from 'fs';

export type ShowMessageBoxTranslation = {
  title: string;
  message: string;
};

const copyFile = async (event: IpcMainEvent, payload: { srcFile: string; destFile: string; translation: ShowMessageBoxTranslation }) => {
  log.info('copy-file');
  try {
    const result = fs.existsSync(payload.srcFile);
    if (!result) return event.sender.send('copy-file/failure', { errorMessage: 'The source file does not exist.' });

    if (fs.existsSync(payload.destFile)) {
      const choice = await dialog.showMessageBox(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
        type: 'warning',
        buttons: ['Yes', 'No'],
        title: payload.translation.title,
        message: payload.translation.message,
        cancelId: 99,
      });

      if (choice.response === 1) {
        log.info('copy-file/failure', 'no');
        return event.sender.send('copy-file/failure', { errorMessage: 'Pressed no' });
      }
      if (choice.response === 99) {
        log.info('copy-file/failure', 'cancel');
        return event.sender.send('copy-file/failure', { errorMessage: 'Pressed cancel' });
      }
    }

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
