import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ProjectFileType = 'studio';
export type ChooseProjectFileToOpenInput = { fileType: ProjectFileType };
export type ChooseProjectFileToOpenOutput = { path: string; dirName: string };

// Note: It looks like another function, it would be better making a more generic service ;)
const chooseProjectFileToOpen = async (payload: { fileType: ProjectFileType }): Promise<ChooseProjectFileToOpenOutput> => {
  log.info('choose-project-file-to-open', payload);
  const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
    properties: ['openFile'],
    filters: [
      {
        name: payload.fileType === 'studio' ? 'Pokémon Studio Project' : 'RPGXP Project',
        extensions: [payload.fileType],
      },
    ],
  });

  if (filePaths.canceled) throw 'Pressed cancel';
  if (filePaths.filePaths.length === 0) throw 'No file selected';

  log.info('choose-project-file-to-open/success', { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
  return { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) };
};

export const registerChooseProjectFileToOpen = defineBackendServiceFunction('choose-project-file-to-open', chooseProjectFileToOpen);
