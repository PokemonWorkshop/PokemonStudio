import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import { SavingText } from '@utils/SavingUtils';

const saveProjectTexts = async (event: IpcMainEvent, payload: { path: string; texts: SavingText }) => {
  log.info('save-project-texts', { path: payload.path });
  try {
    Promise.all(
      payload.texts.map(async (sd) => {
        const file = Number(sd.savingFilename);
        const filePath = path.join(payload.path, file >= 200000 ? 'Data/Text/Studio' : 'Data/Text/Dialogs', file.toString() + '.csv');
        if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else if (sd.data !== undefined) {
          fs.writeFileSync(filePath, stringify(JSON.parse(sd.data) as string[][]));
        }
      })
    )
      .then(() => {
        log.info('save-project-texts/success');
        return event.sender.send('save-project-texts/success', {});
      })
      .catch((error) => {
        log.error('save-project-texts/failure', error);
        return event.sender.send('save-project-texts/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
      });
  } catch (error) {
    log.error('save-project-texts/failure', error);
    event.sender.send('save-project-texts/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerSaveProjectTexts = (ipcMain: IpcMain) => {
  ipcMain.on('save-project-texts', saveProjectTexts);
};
