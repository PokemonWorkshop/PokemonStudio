import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import type { StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { Marshal, MarshalObject } from 'ts-marshal';
import { DbSymbol } from '@modelEntities/dbSymbol';

export type SaveRMXPMapInfoInput = { projectPath: string; mapInfo: string; mapData: string };

type MapData = {
  dbSymbol: DbSymbol;
  name: string;
  id: number;
};

const backupMapInfo = (projectPath: string, mapInfoRMXPFilePath: string) => {
  const backupFilePath = path.join(projectPath, 'Data', 'MapInfos.backup');
  if (fs.existsSync(backupFilePath)) return;

  fs.copyFileSync(mapInfoRMXPFilePath, backupFilePath);
};

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

const getOrders = (mapInfo: StudioMapInfo) => {
  const orders: Record<number, number> = {};
  const rootChildren = mapInfo[0].children;
  const count = { currentOrder: 1 };

  rootChildren.forEach((children) => buildOrders(mapInfo, children, orders, count));
  return orders;
};

const buildOrders = (mapInfo: StudioMapInfo, id: number, orders: Record<number, number>, count: { currentOrder: number }) => {
  const mapInfoValue = mapInfo[id];
  if (!mapInfoValue) return;

  if (mapInfoValue.data.klass === 'MapInfoMap') {
    orders[id] = count.currentOrder;
    count.currentOrder++;
  }
  mapInfoValue.children.forEach((children) => buildOrders(mapInfo, children, orders, count));
};

const getRMXPMapInfo = (mapInfo: StudioMapInfo, mapData: MapData[]) => {
  const orders = getOrders(mapInfo);
  return Object.entries(mapInfo)
    .filter(([, info]) => info.data.klass === 'MapInfoMap')
    .reduce<Map<MarshalObject, MarshalObject>>((marshalObjectMap, [, mapInfoValue]) => {
      const map = mapInfoValue.data.klass === 'MapInfoMap' ? getMap(mapInfoValue.data.mapDbSymbol, mapData) : undefined;
      if (!map) return marshalObjectMap;

      marshalObjectMap.set(map.id, {
        '@scroll_x': 0,
        '@name': map.name,
        '@expanded': mapInfoValue.isExpanded,
        '@order': orders[mapInfoValue.id],
        '@scroll_y': 0,
        '@parent_id': getParendId(mapInfo, mapInfoValue, mapData),
        __class: Symbol.for('RPG::MapInfo'),
      });
      return marshalObjectMap;
    }, new Map<MarshalObject, MarshalObject>());
};

const saveRMXPMapInfo = async (payload: SaveRMXPMapInfoInput) => {
  log.info('save-rmxp-map-info');
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  backupMapInfo(payload.projectPath, mapInfoRMXPFilePath);
  const mapData: MapData[] = JSON.parse(payload.mapData);
  const rmxpMapInfo = getRMXPMapInfo(JSON.parse(payload.mapInfo), mapData);
  fs.writeFileSync(mapInfoRMXPFilePath, Marshal.dump(rmxpMapInfo, { omitStringEncoding: true }));
  log.info('save-rmxp-map-info/success');
  return {};
};

export const registerSaveRMXPMapInfo = defineBackendServiceFunction('save-rmxp-map-info', saveRMXPMapInfo);
