import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';

const saveTextInfos = async (event: IpcMainEvent, payload: { projectPath: string; textInfos: string }) => {
  log.info('save-text-infos');
  try {
    fs.writeFileSync(path.join(payload.projectPath, 'Data', 'Studio', 'text_info.json'), payload.textInfos);
    log.info('save-text-infos/success');
    event.sender.send('save-text-infos/success', {});
  } catch (error) {
    log.error('save-text-infos/failure', error);
    event.sender.send('save-text-infos/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerSaveTextInfos = (ipcMain: IpcMain) => {
  ipcMain.on('save-text-infos', saveTextInfos);
};
