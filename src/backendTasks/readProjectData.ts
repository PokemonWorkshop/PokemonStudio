import { IpcMain, IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { batchArray } from '@utils/batchArray';
import { StudioRMXPMap } from '@modelEntities/mapLink';
import { StudioTextInfo } from '@modelEntities/textInfo';

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
] as const;
type ProjectDataFromBackEndKey = (typeof projectDataKeys)[number];
export type ProjectDataFromBackEnd = Record<ProjectDataFromBackEndKey, string[]> & { rmxpMaps: StudioRMXPMap[]; textInfos: StudioTextInfo[] };

export const readProjectFolder = async (projectPath: string, key: ProjectDataFromBackEndKey): Promise<string[]> => {
  const folderName = path.join(projectPath, 'Data/Studio', key);
  const entries = fs.readdirSync(folderName).filter((f) => {
    return f.endsWith('.json');
  });
  if (entries.length === 0) {
    throw new Error(`Missing data in ${key}`);
  }

  // Batch to prevent reading 1000 files at once, it might cause crash for no reason because node has some limitations
  const batches = batchArray(entries, 10);
  const fileData = await batches.reduce(async (prev, curr) => {
    const prevData = await prev;
    // Reading data
    const batchData = await Promise.allSettled(curr.map((filename) => fsPromises.readFile(path.join(folderName, filename), { encoding: 'utf-8' })));
    // Checking result
    const successfulData = batchData.map((v) => v.status === 'fulfilled' && v.value).filter((v): v is string => v !== false);
    const errorData = batchData.map((v) => v.status === 'rejected' && (v.reason as Error)).filter((v): v is Error => v !== false);
    // Throw in case of error
    if (errorData.length !== 0) {
      throw new Error(errorData.map((error) => error.message).join('; '));
    }
    // Append new data to fileData
    return prevData.concat(successfulData);
  }, Promise.resolve<string[]>([]));

  return fileData;
};

const readProjectData = async (event: IpcMainEvent, payload: { path: string }) => {
  console.info('read-project-data');
  try {
    const rmxpMapsJson = await fsPromises.readFile(path.join(payload.path, 'Data/Studio', 'rmxp_maps.json'), { encoding: 'utf-8' });
    const textInfosJson = await fsPromises.readFile(path.join(payload.path, 'Data/Studio', 'text_info.json'), { encoding: 'utf-8' });
    const rmxpMaps: StudioRMXPMap[] = JSON.parse(rmxpMapsJson);
    const textInfos: StudioTextInfo[] = JSON.parse(textInfosJson);
    const projectData = await projectDataKeys.reduce(async (prev, curr, index) => {
      const prevData = await prev;
      console.info('read-project-data/progress', curr);
      event.sender.send('read-project-data/progress', { step: index + 1, total: projectDataKeys.length, stepText: curr });
      const data = await readProjectFolder(payload.path, curr);
      return { ...prevData, [curr]: data };
    }, Promise.resolve({ rmxpMaps, textInfos } as ProjectDataFromBackEnd));

    console.info('read-project-data/success');
    event.sender.send('read-project-data/success', projectData);
  } catch (error) {
    console.error('read-project-data/failure', error);
    event.sender.send('read-project-data/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadProjectData = (ipcMain: IpcMain) => {
  ipcMain.on('read-project-data', readProjectData);
};
