import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readProjectFolder } from './readProjectData';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID, MAP_VALIDATOR, StudioMap } from '@modelEntities/map';
import { padStr } from '@utils/PadStr';
import { MAP_INFO_VALIDATOR } from '@modelEntities/mapInfo';
import { createMapInfo } from '@utils/entityCreation';
import { addLineCSV, loadCSV } from '@utils/textManagement';
import { stringify } from 'csv-stringify/sync';
import { addNewMapInfo } from '@utils/MapInfoUtils';
import { readRMXPMapInfo } from './readRMXPMapInfo';
import { RMXPMap, readRMXPMap } from './readRMXPMap';

export type RMXP2StudioMapsSyncInput = { projectPath: string };

const readStudioMapInfo = async (mapInfoStudioFilePath: string) => {
  const studioMapInfoData = await fsPromise.readFile(mapInfoStudioFilePath, { encoding: 'utf-8' });
  const mapInfoParsed = MAP_INFO_VALIDATOR.safeParse(JSON.parse(studioMapInfoData));
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

const getAudio = (rmxpMapData?: RMXPMap) => {
  if (!rmxpMapData) return { bgm: undefined, bgs: undefined };

  const bgm = rmxpMapData.autoplayBgm ? rmxpMapData.bgm.name : '';
  const bgs = rmxpMapData.autoplayBgs ? rmxpMapData.bgs.name : '';
  return { bgm, bgs };
};

const RMXP2StudioMapsSync = async (payload: RMXP2StudioMapsSyncInput) => {
  log.info('rmxp-to-studio-maps-sync', payload);
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  const mapInfoStudioFilePath = path.join(payload.projectPath, 'Data', 'Studio', 'map_info.json');

  const rmxpMapInfoData = await readRMXPMapInfo(mapInfoRMXPFilePath);
  let studioMapInfoData = await readStudioMapInfo(mapInfoStudioFilePath);
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
    const { bgm, bgs } = getAudio(rmxpMapData);
    if (studioMap) {
      if (updatedMapNeeded(payload.projectPath, rmxpMap.id)) {
        const updateMap = {
          ...studioMap,
          stepsAverage: rmxpMapData?.encounterStep || studioMap.stepsAverage,
          bgm: bgm === undefined ? studioMap.bgm : bgm,
          bgs: bgs === undefined ? studioMap.bgs : bgs,
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
        bgm: bgm || '',
        bgs: bgs || '',
        mtime: 1,
        sha1: '',
        tiledFilename: '',
      } as StudioMap;
      studioMapInfoData = addNewMapInfo(
        studioMapInfoData,
        createMapInfo(studioMapInfoData, { klass: 'MapInfoMap', mapDbSymbol: newMap.dbSymbol, parentId: 0 })
      );
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
