import type { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { batchArray } from '@utils/batchArray';
import { StudioTextInfo } from '@modelEntities/textInfo';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { StudioMapInfo } from '@modelEntities/mapInfo';
import { setLoadedMaps } from './studioMapToRMXPConversionFacilitator';
import { parseJSON } from '@utils/json/parse';

const projectDataKeys = [
  'abilities',
  'dex',
  'groups',
  'items',
  'moves',
  'pokemon',
  'quests',
  'trainers',
  'types',
  'worldmaps',
  'maplinks',
  'zones',
  'maps',
  'natures',
] as const;
type ProjectDataFromBackEndKey = (typeof projectDataKeys)[number];
export type FilenameWithData = { filename: string; data: string };
export type ProjectDataFromBackEnd = Record<ProjectDataFromBackEndKey, FilenameWithData[]> & { textInfos: StudioTextInfo[]; mapInfo: StudioMapInfo };

export const readProjectFolder = async (projectPath: string, key: ProjectDataFromBackEndKey): Promise<FilenameWithData[]> => {
  const folderName = path.join(projectPath, 'Data/Studio', key);
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  const entries = fs.readdirSync(folderName).filter((f) => {
    return f.endsWith('.json');
  });
  if (entries.length === 0 && key !== 'maps') {
    throw new Error(`Missing data in ${key}`);
  }

  // Batch to prevent reading 1000 files at once, it might cause crash for no reason because node has some limitations
  const batches = batchArray(entries, 10);
  const fileData = await batches.reduce(async (prev, curr) => {
    const prevData = await prev;
    // Reading data
    const batchData = await Promise.allSettled(
      curr.map(async (filename) => ({ filename, data: await fsPromises.readFile(path.join(folderName, filename), { encoding: 'utf-8' }) }))
    );
    // Checking result
    const successfulData = batchData.map((v) => v.status === 'fulfilled' && v.value).filter((v): v is FilenameWithData => v !== false);
    const errorData = batchData.map((v) => v.status === 'rejected' && (v.reason as Error)).filter((v): v is Error => v !== false);
    // Throw in case of error
    if (errorData.length !== 0) {
      throw new Error(errorData.map((error) => error.message).join('; '));
    }
    // Append new data to fileData
    return prevData.concat(successfulData);
  }, Promise.resolve<FilenameWithData[]>([]));

  return fileData;
};
export type ReadProjectDataInput = { path: string };

const readProjectData = async (payload: ReadProjectDataInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('read-project-data');

  const textInfosJson = await fsPromises.readFile(path.join(payload.path, 'Data/Studio', 'text_info.json'), { encoding: 'utf-8' });
  const textInfos: StudioTextInfo[] = parseJSON(textInfosJson, 'text_info.json');
  const mapInfoJson = await fsPromises.readFile(path.join(payload.path, 'Data/Studio', 'map_info.json'), { encoding: 'utf-8' });
  const mapInfo: StudioMapInfo = parseJSON(mapInfoJson, 'map_info.json');
  const projectData = await projectDataKeys.reduce(async (prev, curr, index) => {
    const prevData = await prev;
    log.info('read-project-data/progress', curr);
    sendProgress(event, channels, { step: index + 1, total: projectDataKeys.length, stepText: curr });
    const filenameData = await readProjectFolder(payload.path, curr);
    return { ...prevData, [curr]: filenameData };
  }, Promise.resolve({ textInfos, mapInfo } as ProjectDataFromBackEnd));

  // Store the loaded maps so the converter will know which maps changed
  setLoadedMaps(projectData.maps.map((m) => m.data));
  log.info('read-project-data/success');
  return projectData;
};

export const registerReadProjectData = defineBackendServiceFunction('read-project-data', readProjectData);
