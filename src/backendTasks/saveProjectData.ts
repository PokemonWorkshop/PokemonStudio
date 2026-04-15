import log from 'electron-log';
import fs from 'fs';
import { SavingData } from '@utils/SavingUtils';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { processSavedMaps } from './studioMapToRMXPConversionFacilitator';

export type SaveProjectDataInput = { path: string; data: SavingData };

const saveProjectData = async (payload: SaveProjectDataInput) => {
  log.info('save-project-data', { ...payload, data: payload.data.map(({ savingPath, savingAction }) => ({ savingPath, savingAction })) });
  const projectDataPath = path.join(payload.path, 'Data/Studio/');

  // Ensure PSDK will rebuild the data
  const psdkDatPath = path.join(projectDataPath, 'psdk.dat');
  if (fs.existsSync(psdkDatPath)) fs.unlinkSync(psdkDatPath);

  // Process all the map that changed
  await processSavedMaps(
    projectDataPath.replaceAll('\\', '/'),
    payload.data.filter(({ savingPath, savingAction }) => savingPath.startsWith('maps/') && savingAction !== 'DELETE').map(({ data }) => data || '{}')
  );

  return Promise.all(
    payload.data.map(async (sd) => {
      const filePath = path.join(projectDataPath, sd.savingPath + '.json');
      if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else if (sd.data !== undefined) {
        fs.writeFileSync(filePath, sd.data);
      }
    })
  ).then(() => {
    log.info('save-project-data/success');
    return {};
  });
};

export const registerSaveProjectData = defineBackendServiceFunction('save-project-data', saveProjectData);
