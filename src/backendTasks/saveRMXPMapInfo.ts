import log from 'electron-log';
import path from 'path';
import fsPromise from 'fs/promises';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import type { StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { Marshal, MarshalObject, isMarshalHash } from 'ts-marshal';
import { DbSymbol } from '@modelEntities/dbSymbol';

export type SaveRMXPMapInfoInput = { projectPath: string; mapInfo: string; mapData: string };

type MapData = {
  dbSymbol: DbSymbol;
  name: string;
  id: number;
};

/*const loadMarshalHash = async (mapInfoRMXPFilePath: string) => {
  const mapInfoData = await fsPromise.readFile(mapInfoRMXPFilePath);
  const marshalData = Marshal.load(mapInfoData);
  if (!isMarshalHash(marshalData)) throw new Error('Loaded object is not a Hash');
  return marshalData;
};*/

const getMap = (dbSymbol: DbSymbol, mapData: MapData[]) => {
  return mapData.find((mapData) => mapData.dbSymbol === dbSymbol);
};

const getParendId = (mapInfo: StudioMapInfo, currentMapInfo: StudioMapInfoValue, mapData: MapData[]) => {
  if (currentMapInfo.data.klass !== 'MapInfoMap') return 0;

  const parentId = currentMapInfo.data.parentId;
  const mapInfoParent = mapInfo[parentId];
  if (mapInfoParent.data.klass !== 'MapInfoMap') return 0;

  const parentMap = getMap(mapInfoParent.data.mapDbSymbol, mapData);
  return parentMap ? parentMap.id : 0;
};

const getRMXPMapInfo = (mapInfo: StudioMapInfo, mapData: MapData[]) => {
  return Object.entries(mapInfo)
    .filter(([, info]) => info.data.klass === 'MapInfoMap')
    .reduce<Map<MarshalObject, MarshalObject>>((marshalObjectMap, [, mapInfoValue], index) => {
      const map = mapInfoValue.data.klass === 'MapInfoMap' ? getMap(mapInfoValue.data.mapDbSymbol, mapData) : undefined;
      if (!map) return marshalObjectMap;

      /*const marshalObjectMapInfoValue = new Map<MarshalObject, MarshalObject>();
      marshalObjectMapInfoValue.set('@scroll_x', 0);
      marshalObjectMapInfoValue.set('@name', map.name);
      marshalObjectMapInfoValue.set('@expanded', mapInfoValue.isExpanded);
      marshalObjectMapInfoValue.set('@order', index); // TODO:
      marshalObjectMapInfoValue.set('@scroll_y', 0);
      marshalObjectMapInfoValue.set('@parent_id', getParendId(mapInfo, mapInfoValue, mapData));

      marshalObjectMap.set(map.id, marshalObjectMapInfoValue);*/

      marshalObjectMap.set(map.id, {
        '@scroll_x': 0,
        '@name': map.name,
        '@expanded': mapInfoValue.isExpanded,
        '@order': index, // TODO:
        '@scroll_y': 0,
        '@parent_id': getParendId(mapInfo, mapInfoValue, mapData),
        __class: 'Hash',
      });

      return marshalObjectMap;
    }, new Map<MarshalObject, MarshalObject>());
};

const saveRMXPMapInfo = async (payload: SaveRMXPMapInfoInput) => {
  log.info('save-rmxp-map-info');
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  //const marshalHash = await loadMarshalHash(mapInfoRMXPFilePath);
  const mapData: MapData[] = JSON.parse(payload.mapData);
  const rmxpMapInfo = getRMXPMapInfo(JSON.parse(payload.mapInfo), mapData);

  //const { __class, __extendedModules, __default } = marshalHash;
  //const newMarshalObject = { __class, __extendedModules, __default, ...Object.fromEntries(rmxpMapInfo) };
  //log.info(newMarshalObject);
  fs.writeFileSync(mapInfoRMXPFilePath, Marshal.dump(rmxpMapInfo));
  log.info('save-rmxp-map-info/success');
  return {};
};

export const registerSaveRMXPMapInfo = defineBackendServiceFunction('save-rmxp-map-info', saveRMXPMapInfo);
