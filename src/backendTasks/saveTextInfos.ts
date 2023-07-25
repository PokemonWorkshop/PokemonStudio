import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SaveTextInfosInput = { projectPath: string; textInfos: string };

const saveTextInfos = async (payload: SaveTextInfosInput) => {
  log.info('save-text-infos');
  fs.writeFileSync(path.join(payload.projectPath, 'Data', 'Studio', 'text_info.json'), payload.textInfos);
  log.info('save-text-infos/success');
  return {};
};

export const registerSaveTextInfos = defineBackendServiceFunction('save-text-infos', saveTextInfos);
