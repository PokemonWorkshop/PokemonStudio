import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import type ProjectStudioModel from '@modelEntities/ProjectStudio.model';

const readProjectMetadata = async (event: IpcMainEvent, payload: { path: string }) => {
  log.info('read-project-metadata');
  try {
    const metaDataJson = fs.readFileSync(path.join(payload.path, 'project.studio'), { encoding: 'utf-8' });
    const metaData: Omit<ProjectStudioModel, 'clone'> = JSON.parse(metaDataJson);
    log.info('read-project-metadata/success', { metaData });
    event.sender.send('read-project-metadata/success', { metaData });
  } catch (error) {
    log.error('read-project-metadata/failure', error);
    event.sender.send('read-project-metadata/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadProjectMetadata = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('read-project-metadata', readProjectMetadata);
};
