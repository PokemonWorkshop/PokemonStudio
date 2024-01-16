import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import { SavingText } from '@utils/SavingUtils';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { getTextPath } from '@utils/textManagement';

export type SaveProjectTextsInput = { path: string; texts: SavingText };

const saveProjectTexts = async (payload: SaveProjectTextsInput) => {
  log.info('save-project-texts', { path: payload.path });
  return Promise.all(
    payload.texts.map(async (sd) => {
      const file = Number(sd.savingFilename);
      const filePath = path.join(payload.path, getTextPath(file), file.toString() + '.csv');
      if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else if (sd.data !== undefined) {
        fs.writeFileSync(filePath, stringify(JSON.parse(sd.data) as string[][]));
      }
    })
  ).then(() => {
    log.info('save-project-texts/success');
    return {};
  });
};

export const registerSaveProjectTexts = defineBackendServiceFunction('save-project-texts', saveProjectTexts);
