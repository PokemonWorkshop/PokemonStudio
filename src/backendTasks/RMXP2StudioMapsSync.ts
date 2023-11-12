import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { isMarshalHash, isMarshalStandardObject, Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readProjectFolder } from './readProjectData';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID, MAP_VALIDATOR, StudioMap } from '@modelEntities/map';
import { padStr } from '@utils/PadStr';
import { MAP_INFO_DATA_VALIDATOR } from '@modelEntities/mapInfo';
import { createMapInfo } from '@utils/entityCreation';
import { addLineCSV, loadCSV } from '@utils/textManagement';
import { stringify } from 'csv-stringify/sync';

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

type AudioData = { '@name': string; '@volume': number; '@pitch': number };

type MapData = {
  '@tileset_id': number;
  '@width': number;
  '@height': number;
  '@autoplay_bgm': boolean;
  '@bgm': AudioData;
  '@autoplay_bgs': boolean;
  '@bgs': AudioData;
  '@encounter_list': unknown[];
  '@encounter_step': number;
  '@data': unknown;
  '@events': unknown;
};

const isMapInfoObject = (object: unknown): object is MapInfoData =>
  isMarshalStandardObject(object) &&
  '@order' in object &&
  '@name' in object &&
  typeof object['@order'] === 'number' &&
  typeof object['@name'] === 'string';

const isMapObject = (object: unknown): object is MapData =>
  isMarshalStandardObject(object) &&
  '@bgm' in object &&
  '@bgs' in object &&
  '@encounter_step' in object &&
  typeof object['@bgm'] === 'object' &&
  typeof object['@bgs'] === 'object' &&
  typeof object['@encounter_step'] === 'number';

const isRecord = (object: unknown): object is Record<string | symbol, unknown> => typeof object === 'object' && object !== null;

const addAudioExtensionFile = (projectPath: string, filename: string, type: 'bgm' | 'bgs') => {
  const filePath = path.join(projectPath, 'Audio', type, filename);
  const ext = ['ogg', 'mp3', 'midi', 'mid', 'aac', 'wav', 'flac'].find((ext) => fs.existsSync(`${filePath}.${ext}`));
  if (!ext) return filename;

  return `${filename}.${ext}`;
};

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

const readRMXPMap = async (projectPath: string, mapId: number) => {
  const mapData = await fsPromise.readFile(path.join(projectPath, 'Data', `Map${padStr(mapId, 3)}.rxdata`));
  const marshalData = Marshal.load(mapData);
  if (!isRecord(marshalData)) throw new Error('Loaded object is not a Record');

  if (!isMapObject(marshalData)) return undefined;

  return {
    encounterStep: marshalData['@encounter_step'],
    bgm: addAudioExtensionFile(projectPath, marshalData['@bgm']['@name'], 'bgm'),
    bgs: addAudioExtensionFile(projectPath, marshalData['@bgs']['@name'], 'bgs'),
  };
};

const readStudioMapInfo = async (mapInfoStudioFilePath: string) => {
  const studioMapInfoData = await fsPromise.readFile(mapInfoStudioFilePath, { encoding: 'utf-8' });
  const mapInfoParsed = MAP_INFO_DATA_VALIDATOR.safeParse(JSON.parse(studioMapInfoData));
  if (!mapInfoParsed.success) throw new Error('Failed to parse the file map_info.json');

  return mapInfoParsed.data;
};

const updatedMapNeeded = (projectPath: string, id: number) => {
  const studioMapPath = path.join(projectPath, 'Data/Studio/Maps', `map${padStr(id, 3)}.json`);
  const rmxpMapPath = path.join(projectPath, 'Data', `Map${padStr(id, 3)}.rxdata`);
  return fs.statSync(rmxpMapPath).mtime > fs.statSync(studioMapPath).mtime;
};

const updatedCSVNeeded = (projectPath: string, mapInfoRMXPFilePath: string) => {
  const csvPath = path.join(projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`);
  return fs.statSync(mapInfoRMXPFilePath).mtime > fs.statSync(csvPath).mtime;
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
  const mapNames = await loadCSV(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`));
  const mapNameColumnLength = mapNames[0]?.length || 0;
  const mapDescriptions = await loadCSV(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_DESCRIPTION_TEXT_ID}.csv`));
  const mapDescrColumnLength = mapDescriptions[0]?.length || 0;

  await rmxpMapInfoData.reduce(async (lastPromise, rmxpMap) => {
    await lastPromise;

    const rmxpMapData = await readRMXPMap(payload.projectPath, rmxpMap.id);
    const studioMap = studioMaps.find((studioMap) => studioMap.id === rmxpMap.id);
    if (studioMap) {
      if (updatedMapNeeded(payload.projectPath, rmxpMap.id)) {
        const updateMap = {
          ...studioMap,
          stepsAverage: rmxpMapData?.encounterStep || studioMap.stepsAverage,
          bgm: rmxpMapData?.bgm || studioMap.bgm,
          bgs: rmxpMapData?.bgs || studioMap.bgs,
        };
        fsPromise.writeFile(path.join(payload.projectPath, 'Data/Studio/maps', `${updateMap.dbSymbol}.json`), JSON.stringify(updateMap, null, 2));
      }
      if (updatedCSVNeeded(payload.projectPath, mapInfoRMXPFilePath)) {
        addLineCSV(new Array(mapNameColumnLength).fill(rmxpMap.name), rmxpMap.id + 1, 0, mapNames);
      }
    } else {
      const newMap = {
        klass: 'Map',
        id: rmxpMap.id,
        dbSymbol: `map${padStr(rmxpMap.id, 3)}`,
        stepsAverage: rmxpMapData?.encounterStep || 1,
        bgm: rmxpMapData?.bgm || '',
        bgs: rmxpMapData?.bgs || '',
        mtime: 1,
        sha1: '',
        tiledFilename: '',
      } as StudioMap;
      studioMapInfoData.push(createMapInfo(studioMapInfoData, { klass: 'MapInfoMap', mapDbSymbol: newMap.dbSymbol }));
      fsPromise.writeFile(path.join(payload.projectPath, 'Data/Studio/maps', `${newMap.dbSymbol}.json`), JSON.stringify(newMap, null, 2));
      addLineCSV(new Array(mapNameColumnLength).fill(rmxpMap.name), rmxpMap.id + 1, 0, mapNames);
      addLineCSV(new Array(mapDescrColumnLength).fill(''), rmxpMap.id + 1, 0, mapDescriptions);
    }
  }, Promise.resolve());

  await fsPromise.writeFile(mapInfoStudioFilePath, JSON.stringify(studioMapInfoData, null, 2));
  await fsPromise.writeFile(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`), stringify(mapNames));
  await fsPromise.writeFile(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_DESCRIPTION_TEXT_ID}.csv`), stringify(mapDescriptions));

  log.info('rmxp-to-studio-maps-sync/success');
  return {};
};

export const registerRMXP2StudioMapsSync = defineBackendServiceFunction('rmxp-to-studio-maps-sync', RMXP2StudioMapsSync);
