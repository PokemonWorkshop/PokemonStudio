import log from 'electron-log';
import fs from 'fs';
import { SavingConfig } from '@utils/SavingUtils';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SaveProjectConfigInput = { path: string; configs: SavingConfig };

const saveProjectConfigs = async (payload: SaveProjectConfigInput) => {
  log.info('save-project-configs', {
    ...payload,
    configs: payload.configs.map(({ savingFilename, savingAction }) => ({ savingFilename, savingAction })),
  });
  const configsPath = path.join(payload.path, 'Data/configs');
  return Promise.all(
    payload.configs.map(async (sd) => {
      const filePath = path.join(configsPath, sd.savingFilename + '.json');
      if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else if (sd.data !== undefined) {
        fs.writeFileSync(filePath, sd.data);
      }
    })
  ).then(() => {
    log.info('save-project-configs/success');
    return {};
  });
};

export const registerSaveProjectConfigs = defineBackendServiceFunction('save-project-configs', saveProjectConfigs);
