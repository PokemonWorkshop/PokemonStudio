import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { SavingData } from '@utils/SavingUtils';
import path from 'path';

const saveProjectData = async (event: IpcMainEvent, payload: { path: string; data: SavingData }) => {
  log.info('save-project-data', { ...payload, data: payload.data.map(({ savingPath, savingAction }) => ({ savingPath, savingAction })) });
  const projectDataPath = path.join(payload.path, 'Data/Studio/');

  try {
    // Ensure PSDK will rebuild the data
    const psdkDatPath = path.join(projectDataPath, 'psdk.dat');
    if (fs.existsSync(psdkDatPath)) fs.unlinkSync(psdkDatPath);

    Promise.all(
      payload.data.map(async (sd) => {
        const filePath = path.join(projectDataPath, sd.savingPath + '.json');
        if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else if (sd.data !== undefined) {
          fs.writeFileSync(filePath, sd.data);
        }
      })
    )
      .then(() => {
        log.info('save-project-data/success');
        return event.sender.send('save-project-data/success', {});
      })
      .catch((error) => {
        log.error('save-project-data/failure', error);
        return event.sender.send('save-project-data/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
      });
  } catch (error) {
    log.error('save-project-data/failure', error);
    event.sender.send('save-project-data/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerSaveProjectData = (ipcMain: IpcMain) => {
  ipcMain.on('save-project-data', saveProjectData);
};
