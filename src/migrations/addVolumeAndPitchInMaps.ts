import { IpcMainEvent } from 'electron';
import { deletePSDKDatFile } from './migrateUtils';
import { MAP_VALIDATOR, StudioMap } from '@modelEntities/map';
import fsPromise from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import { readRMXPMap } from '@src/backendTasks/readRMXPMap';
import log from 'electron-log';
import { parseJSON } from '@utils/json/parse';

const PRE_MIGRATION_MAP_VALIDATOR = MAP_VALIDATOR.omit({ bgm: true, bgs: true }).extend({ bgm: z.string(), bgs: z.string() });
type StudioMapDataBeforeMigration = z.infer<typeof PRE_MIGRATION_MAP_VALIDATOR>;

const updateAudio = (name: string, volume: number, pitch: number) => {
  return {
    name,
    volume,
    pitch,
  };
};

const addVolumeAndPitch = async (map: StudioMapDataBeforeMigration, projectPath: string): Promise<StudioMap> => {
  try {
    const rmxpMap = await readRMXPMap(projectPath, map.id);
    if (rmxpMap) {
      return {
        ...map,
        bgm: updateAudio(map.bgm, rmxpMap.bgm.volume, rmxpMap.bgm.pitch),
        bgs: updateAudio(map.bgs, rmxpMap.bgs.volume, rmxpMap.bgs.pitch),
      };
    }
  } catch (error) {
    // The migration is not stop if there is an error with the rmxp map. The default values will be used.
    log.warn(error);
  }
  return {
    ...map,
    bgm: updateAudio(map.bgm, 100, 100),
    bgs: updateAudio(map.bgs, 100, 100),
  };
};

export const addVolumeAndPitchInMaps = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const maps = await readProjectFolder(projectPath, 'maps');
  await maps.reduce(async (lastPromise, map) => {
    await lastPromise;
    const mapParsed = PRE_MIGRATION_MAP_VALIDATOR.safeParse(parseJSON(map.data, map.filename));
    if (mapParsed.success) {
      const newMap = await addVolumeAndPitch(mapParsed.data, projectPath);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/maps', `${newMap.dbSymbol}.json`), JSON.stringify(newMap, null, 2));
    }
  }, Promise.resolve());
};
