import { BrowserWindow, dialog, IpcMainEvent, IpcMain } from 'electron';
import log from 'electron-log';
import path from 'path';

export type ProjectFileType = 'studio';

const chooseProjectFileToOpen = async (event: IpcMainEvent, payload: { fileType: ProjectFileType }) => {
  log.info('choose-project-file-to-open', payload);
  try {
    const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      properties: ['openFile'],
      filters: [
        {
          name: payload.fileType === 'studio' ? 'Pokémon Studio Project' : 'RPGXP Project',
          extensions: [payload.fileType],
        },
      ],
    });

    if (filePaths.canceled) {
      log.info('choose-project-file-to-open/failure', 'cancel');
      return event.sender.send('choose-project-file-to-open/failure', { errorMessage: 'Pressed cancel' });
    }
    if (filePaths.filePaths.length === 0) {
      log.info('choose-project-file-to-open/failure', 'no files');
      return event.sender.send('choose-project-file-to-open/failure', { errorMessage: 'No file selected' });
    }
    log.info('choose-project-file-to-open/success', { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
    event.sender.send('choose-project-file-to-open/success', { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
  } catch (error) {
    log.error('choose-project-file-to-open/failure', error);
    event.sender.send('choose-project-file-to-open/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerChooseProjectFileToOpen = (ipcMain: IpcMain) => {
  ipcMain.on('choose-project-file-to-open', chooseProjectFileToOpen);
};
