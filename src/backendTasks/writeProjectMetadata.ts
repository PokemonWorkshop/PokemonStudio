import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';

const writeProjectMetadata = async (event: IpcMainEvent, payload: { path: string; metaData: string }) => {
  log.info('write-project-metadata');
  try {
    fs.writeFileSync(path.join(payload.path, 'project.studio'), payload.metaData);
    log.info('write-project-metadata/success');
    event.sender.send('write-project-metadata/success', {});
  } catch (error) {
    log.error('write-project-metadata/failure', error);
    event.sender.send('write-project-metadata/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerWriteProjectMetadata = (ipcMain: IpcMain) => {
  ipcMain.on('write-project-metadata', writeProjectMetadata);
};
