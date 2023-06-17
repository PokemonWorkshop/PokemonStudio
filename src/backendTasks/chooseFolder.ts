import Electron, { BrowserWindow, dialog, IpcMainEvent } from 'electron';
import log from 'electron-log';

const chooseFolder = async (event: IpcMainEvent) => {
  log.info('choose-folder');
  try {
    const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    });

    if (filePaths.canceled) {
      log.info('choose-folder/failure', 'cancel');
      return event.sender.send('choose-folder/failure', { errorMessage: 'Pressed cancel' });
    }
    if (filePaths.filePaths.length === 0) {
      log.info('choose-folder/failure', 'no files');
      return event.sender.send('choose-folder/failure', { errorMessage: 'No folder selected' });
    }
    log.info('choose-folder/success', { folderPath: filePaths.filePaths[0] });
    event.sender.send('choose-folder/success', { folderPath: filePaths.filePaths[0] });
  } catch (error) {
    log.error('choose-folder/failure', error);
    event.sender.send('choose-folder/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerChooseFolder = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('choose-folder', chooseFolder);
};
