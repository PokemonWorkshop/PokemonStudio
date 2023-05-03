import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { StudioProject } from '@modelEntities/project';

const writeProjectMetadata = async (event: IpcMainEvent, payload: { path: string; metaData: StudioProject }) => {
  log.info('write-project-metadata');
  try {
    fs.writeFileSync(path.join(payload.path, 'project.studio'), JSON.stringify(payload.metaData, null, 2));
    console.info('write-project-metadata/success');
    event.sender.send('write-project-metadata/success', {});
  } catch (error) {
    console.error('write-project-metadata/failure', error);
    event.sender.send('write-project-metadata/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerWriteProjectMetadata = (ipcMain: IpcMain) => {
  ipcMain.on('write-project-metadata', writeProjectMetadata);
};
