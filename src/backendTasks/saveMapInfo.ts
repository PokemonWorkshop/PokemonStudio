import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SaveMapInfoInput = { projectPath: string; mapInfo: string };

const saveMapInfo = async (payload: SaveMapInfoInput) => {
  log.info('save-map-info');
  fs.writeFileSync(path.join(payload.projectPath, 'Data', 'Studio', 'map_info.json'), payload.mapInfo);
  log.info('save-map-info/success');
  return {};
};

export const registerSaveMapInfo = defineBackendServiceFunction('save-map-info', saveMapInfo);
