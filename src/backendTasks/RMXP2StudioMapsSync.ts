import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readProjectFolder } from './readProjectData';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID, MAP_VALIDATOR, StudioMap } from '@modelEntities/map';
import { padStr } from '@utils/PadStr';
import { DEFAULT_MAP_INFO, StudioMapInfo } from '@modelEntities/mapInfo';
import { createMapInfo } from '@utils/entityCreation';
import { addLineCSV, loadCSV } from '@utils/textManagement';
import { stringify } from 'csv-stringify/sync';
import { addNewMapInfo } from '@utils/MapInfoUtils';
import { readRMXPMapInfo } from './readRMXPMapInfo';
import { RMXPMap, readRMXPMap } from './readRMXPMap';
import { DbSymbol } from '@modelEntities/dbSymbol';

export type RMXP2StudioMapsSyncInput = { projectPath: string };

const updatedMapNeeded = (projectPath: string, id: number) => {
  const studioMapPath = path.join(projectPath, 'Data/Studio/Maps', `map${padStr(id, 3)}.json`);
  const rmxpMapPath = path.join(projectPath, 'Data', `Map${padStr(id, 3)}.rxdata`);
  return fs.statSync(rmxpMapPath).mtime > fs.statSync(studioMapPath).mtime;
};

const updatedCSVNeeded = (projectPath: string, mapInfoRMXPFilePath: string) => {
  const csvPath = path.join(projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`);
  return fs.statSync(mapInfoRMXPFilePath).mtime > fs.statSync(csvPath).mtime;
};

const getAudio = (rmxpMapData?: RMXPMap) => {
  const defaultAudio = { name: '', volume: 100, pitch: 100 };
  if (!rmxpMapData) return { bgm: undefined, bgs: undefined };

  const bgm = rmxpMapData.autoplayBgm ? rmxpMapData.bgm : defaultAudio;
  const bgs = rmxpMapData.autoplayBgs ? rmxpMapData.bgs : defaultAudio;
  return { bgm, bgs };
};

const updateStudioMapInfo = async (rmxpMapInfoData: { id: number; name: string; parentId: number }[], projectPath: string) => {
  const mapInfoStudioFilePath = path.join(projectPath, 'Data', 'Studio', 'map_info.json');
  let studioMapInfoData = DEFAULT_MAP_INFO;

  // Build the studio map info (all parentId = 0)
  rmxpMapInfoData.map((rmxpMapInfo) => {
    const newMapInfo = createMapInfo(studioMapInfoData, {
      klass: 'MapInfoMap',
      mapDbSymbol: `map${padStr(rmxpMapInfo.id, 3)}` as DbSymbol,
      parentId: 0,
    });
    studioMapInfoData = addNewMapInfo(studioMapInfoData, newMapInfo);
  });

  // Assign the parentId
  const studioMapInfoDataValues = Object.values(studioMapInfoData);
  studioMapInfoDataValues.forEach((mapInfo) => {
    if (mapInfo.data.klass !== 'MapInfoMap') return;

    const mapDbSymbol = mapInfo.data.mapDbSymbol;
    const rmxpMapInfo = rmxpMapInfoData.find((rmxpMapInfo) => mapDbSymbol === `map${padStr(rmxpMapInfo.id, 3)}`);
    if (!rmxpMapInfo) return;

    const studioMapInfo = studioMapInfoDataValues.find(
      (studioMapInfo) => studioMapInfo.data.klass === 'MapInfoMap' && studioMapInfo.data.mapDbSymbol === `map${padStr(rmxpMapInfo.parentId, 3)}`
    );
    if (!studioMapInfo) return;

    mapInfo.data.parentId = studioMapInfo.id;
    studioMapInfo.children.push(mapInfo.id);
    studioMapInfo.hasChildren = true;

    // Clear the root
    const index = studioMapInfoDataValues[0].children.findIndex((child) => child === mapInfo.id);
    if (index === -1) return;

    studioMapInfoDataValues[0].children.splice(index, 1);
  });

  // Convert studioMapInfoDataValues array to record
  studioMapInfoData = studioMapInfoDataValues.reduce((prev, mapInfo) => {
    prev[mapInfo.id.toString()] = mapInfo;
    return prev;
  }, {} as StudioMapInfo);

  // Expand all items belonging to the root
  studioMapInfoData[0].children.forEach((id) => {
    studioMapInfoData[id].isExpanded = studioMapInfoData[id].children.length > 0;
  });

  await fsPromise.writeFile(mapInfoStudioFilePath, JSON.stringify(studioMapInfoData, null, 2));
};

const createNewMap = (payload: { rmxpMap: { id: number; name: string }; rmxpMapData: RMXPMap | undefined; projectPath: string }) => {
  const { bgm, bgs } = getAudio(payload.rmxpMapData);
  const newMap = {
    klass: 'Map',
    id: payload.rmxpMap.id,
    dbSymbol: `map${padStr(payload.rmxpMap.id, 3)}`,
    stepsAverage: payload.rmxpMapData?.encounterStep || 1,
    bgm: bgm ?? { name: '', volume: 100, pitch: 100 },
    bgs: bgs ?? { name: '', volume: 100, pitch: 100 },
    mtime: 1,
    sha1: '',
    tiledFilename: '',
  } as StudioMap;
  fsPromise.writeFile(path.join(payload.projectPath, 'Data/Studio/maps', `${newMap.dbSymbol}.json`), JSON.stringify(newMap, null, 2));
};

const readMaps = async (projectPath: string) => {
  const maps = await readProjectFolder(projectPath, 'maps');
  return maps.reduce((data, map) => {
    const mapParsed = MAP_VALIDATOR.safeParse(JSON.parse(map));
    if (mapParsed.success) {
      data.push(mapParsed.data);
    }
    return data;
  }, [] as StudioMap[]);
};

const updateMap = (payload: {
  rmxpMap: { id: number; name: string };
  rmxpMapData: RMXPMap | undefined;
  studioMap: StudioMap;
  projectPath: string;
}) => {
  if (!updatedMapNeeded(payload.projectPath, payload.rmxpMap.id)) return;

  const { bgm, bgs } = getAudio(payload.rmxpMapData);
  const studioMap = payload.studioMap;
  const updateMap = {
    ...studioMap,
    stepsAverage: payload.rmxpMapData?.encounterStep || studioMap.stepsAverage,
    bgm: bgm === undefined ? studioMap.bgm : bgm,
    bgs: bgs === undefined ? studioMap.bgs : bgs,
  };
  fsPromise.writeFile(path.join(payload.projectPath, 'Data/Studio/maps', `${updateMap.dbSymbol}.json`), JSON.stringify(updateMap, null, 2));
};

const deleteMaps = async (studioMaps: StudioMap[], rmxpMapIds: number[], projectPath: string) => {
  return await studioMaps.reduce(async (lastPromise, studioMap) => {
    await lastPromise;

    if (!rmxpMapIds.includes(studioMap.id)) {
      const mapToDeletePath = path.join(projectPath, 'Data/Studio/maps', `${studioMap.dbSymbol}.json`);
      if (fs.existsSync(mapToDeletePath)) {
        fsPromise.unlink(path.join(projectPath, 'Data/Studio/maps', `${studioMap.dbSymbol}.json`));
      }
    }
  }, Promise.resolve());
};

const RMXP2StudioMapsSync = async (payload: RMXP2StudioMapsSyncInput) => {
  log.info('rmxp-to-studio-maps-sync', payload);
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  const rmxpMapInfoData = await readRMXPMapInfo(mapInfoRMXPFilePath);
  const rmxpMapIds = rmxpMapInfoData.map(({ id }) => id);

  const studioMaps = await readMaps(payload.projectPath);
  const mapNames = await loadCSV(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`));
  const mapNameColumnLength = mapNames[0]?.length || 0;
  const mapDescriptions = await loadCSV(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_DESCRIPTION_TEXT_ID}.csv`));
  const mapDescrColumnLength = mapDescriptions[0]?.length || 0;

  await updateStudioMapInfo(rmxpMapInfoData, payload.projectPath);

  await rmxpMapInfoData.reduce(async (lastPromise, rmxpMap) => {
    await lastPromise;

    const rmxpMapData = await readRMXPMap(payload.projectPath, rmxpMap.id);
    const studioMap = studioMaps.find((studioMap) => studioMap.id === rmxpMap.id);
    if (studioMap) {
      updateMap({ rmxpMap, rmxpMapData, studioMap, projectPath: payload.projectPath });
      if (updatedCSVNeeded(payload.projectPath, mapInfoRMXPFilePath)) {
        addLineCSV(new Array(mapNameColumnLength).fill(rmxpMap.name), rmxpMap.id + 1, 0, mapNames);
      }
    } else {
      createNewMap({ rmxpMap, rmxpMapData, projectPath: payload.projectPath });
      addLineCSV(new Array(mapNameColumnLength).fill(rmxpMap.name), rmxpMap.id + 1, 0, mapNames);
      addLineCSV(new Array(mapDescrColumnLength).fill(''), rmxpMap.id + 1, 0, mapDescriptions);
    }
  }, Promise.resolve());

  await deleteMaps(studioMaps, rmxpMapIds, payload.projectPath);
  await fsPromise.writeFile(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_NAME_TEXT_ID}.csv`), stringify(mapNames));
  await fsPromise.writeFile(path.join(payload.projectPath, 'Data/Text/Studio', `${MAP_DESCRIPTION_TEXT_ID}.csv`), stringify(mapDescriptions));

  log.info('rmxp-to-studio-maps-sync/success');
  return {};
};

export const registerRMXP2StudioMapsSync = defineBackendServiceFunction('rmxp-to-studio-maps-sync', RMXP2StudioMapsSync);
