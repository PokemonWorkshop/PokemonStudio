import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ChooseFolderOutput = { folderPath: string };

const chooseFolder = async (): Promise<ChooseFolderOutput> => {
  log.info('choose-folder');
  const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
    properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
  });

  if (filePaths.canceled) throw 'Pressed cancel';
  if (filePaths.filePaths.length === 0) throw 'No folder selected';

  log.info('choose-folder/success', { folderPath: filePaths.filePaths[0] });
  return { folderPath: filePaths.filePaths[0] };
};

export const registerChooseFolder = defineBackendServiceFunction('choose-folder', chooseFolder);
