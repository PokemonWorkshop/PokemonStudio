import log from 'electron-log';
import path from 'path';
import fsPromises from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readProjectFolder } from './readProjectData';
import { loadCSV } from '@utils/textManagement';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';

export type ReadMapsInput = { projectPath: string };
export type ReadMapsOutput = { maps: string[]; mapInfo: string; mapNames: string[][]; mapDescriptions: string[][] };

const readMaps = async (payload: ReadMapsInput): Promise<ReadMapsOutput> => {
  log.info('read-maps', payload);
  const csvPath = path.join(payload.projectPath, 'Data', 'Text', 'Studio');

  const maps = (await readProjectFolder(payload.projectPath, 'maps')).map(m => m.data);
  const mapInfo = await fsPromises.readFile(path.join(payload.projectPath, 'Data/Studio', 'map_info.json'), { encoding: 'utf-8' });
  const mapNames = await loadCSV(path.join(csvPath, `${MAP_NAME_TEXT_ID}.csv`));
  const mapDescriptions = await loadCSV(path.join(csvPath, `${MAP_DESCRIPTION_TEXT_ID}.csv`));

  log.info('read-maps/success');
  // Todo verify this
  return { maps, mapInfo, mapNames, mapDescriptions };
};

export const registerReadMaps = defineBackendServiceFunction('read-maps', readMaps);
