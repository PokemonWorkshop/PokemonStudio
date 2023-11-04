import log from 'electron-log';
import path from 'path';
import fsPromise from 'fs/promises';
import { isMarshalHash, isMarshalStandardObject, Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readProjectFolder } from './readProjectData';
import { MAP_VALIDATOR, StudioMap } from '@modelEntities/map';
import { padStr } from '@utils/PadStr';
import { MAP_INFO_DATA_VALIDATOR } from '@modelEntities/mapInfo';
import { createMapInfo } from '@utils/entityCreation';

export type RMXP2StudioMapsSyncInput = { projectPath: string };

type MapInfoData = {
  '@scroll_x': number;
  '@name': string;
  '@expanded': boolean;
  '@order': number;
  '@scroll_y': number;
  '@parent_id': number;
  __class: symbol;
};

const isMapInfoObject = (object: unknown): object is MapInfoData =>
  isMarshalStandardObject(object) &&
  '@order' in object &&
  '@name' in object &&
  typeof object['@order'] === 'number' &&
  typeof object['@name'] === 'string';

const readRMXPMapInfo = async (mapInfoFilePath: string) => {
  const mapInfoData = await fsPromise.readFile(mapInfoFilePath);
  const marshalData = Marshal.load(mapInfoData);
  if (!isMarshalHash(marshalData)) throw new Error('Loaded object is not a Hash');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __class, __extendedModules, __default, ...mapInfos } = marshalData;
  const mapInfoRecords = Object.entries(mapInfos)
    .map(([id, data]) => (isMapInfoObject(data) ? { id: Number(id), order: data['@order'], name: data['@name'] } : undefined))
    .filter(<T>(data: T): data is Exclude<T, undefined> => !!data);
  const rmxpMapData = mapInfoRecords.sort((a, b) => a.order - b.order).map(({ id, name }) => ({ id, name }));
  return rmxpMapData;
};

const readStudioMapInfo = async (mapInfoStudioFilePath: string) => {
  const studioMapInfoData = await fsPromise.readFile(path.join(mapInfoStudioFilePath, 'Data/Studio', 'map_info.json'), { encoding: 'utf-8' });
  const mapInfoParsed = MAP_INFO_DATA_VALIDATOR.safeParse(JSON.parse(studioMapInfoData));
  if (!mapInfoParsed.success) throw new Error('Fail to parse the file map_info.json');

  return mapInfoParsed.data;
};

const RMXP2StudioMapsSync = async (payload: RMXP2StudioMapsSyncInput) => {
  log.info('rmxp-to-studio-maps-sync', payload);
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  const mapInfoStudioFilePath = path.join(payload.projectPath, 'Data', 'Studio', 'map_info.json');

  const rmxpMapInfoData = await readRMXPMapInfo(mapInfoRMXPFilePath);
  const studioMapInfoData = await readStudioMapInfo(mapInfoStudioFilePath);
  const maps = await readProjectFolder(payload.projectPath, 'maps');
  const studioMaps = maps.reduce((data, map) => {
    const mapParsed = MAP_VALIDATOR.safeParse(JSON.parse(map));
    if (mapParsed.success) {
      data.push(mapParsed.data);
    }
    return data;
  }, [] as StudioMap[]);

  await rmxpMapInfoData.reduce(async (lastPromise, rmxpMap) => {
    await lastPromise;

    const isMapExists = studioMaps.find((studioMap) => studioMap.id === rmxpMap.id);
    if (isMapExists) {
      // TODO: update map name in csv
    } else {
      const newMap = {
        klass: 'Map',
        id: rmxpMap.id,
        dbSymbol: `map${padStr(rmxpMap.id, 3)}`,
        stepsAverage: 1,
        bgm: '',
        bgs: '',
        mtime: 0,
        sha1: '',
        tiledFilename: '',
      } as StudioMap;
      const newMapInfo = createMapInfo(studioMapInfoData, { klass: 'MapInfoMap', mapDbSymbol: newMap.dbSymbol });
      studioMapInfoData.push(newMapInfo);
      fsPromise.writeFile(path.join(payload.projectPath, 'Data/Studio/maps', `${newMap.dbSymbol}.json`), JSON.stringify(newMap, null, 2));
      // TODO: add the map name in the csv
    }
  }, Promise.resolve());

  await fsPromise.writeFile(mapInfoStudioFilePath, JSON.stringify(studioMapInfoData, null, 2));

  return {};
};

export const registerRMXP2StudioMapsSync = defineBackendServiceFunction('rmxp-to-studio-maps-sync', RMXP2StudioMapsSync);
