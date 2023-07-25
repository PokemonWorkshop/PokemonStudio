import { dialog, BrowserWindow } from 'electron';
import log from 'electron-log';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ChooseFileInput = { name: string; extensions: string[] };
export type ChooseFileOutput = { path: string; dirName: string };

const chooseFile = async (payload: ChooseFileInput): Promise<ChooseFileOutput> => {
  log.info('choose-file', payload);

  const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
    properties: ['openFile'],
    filters: [
      {
        name: payload.name,
        extensions: payload.extensions,
      },
    ],
  });

  if (filePaths.canceled) throw 'Pressed cancel';
  if (filePaths.filePaths.length === 0) throw 'No file selected';

  log.info('choose-file/success', { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
  return { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) };
};

export const registerChooseFile = defineBackendServiceFunction('choose-file', chooseFile);
