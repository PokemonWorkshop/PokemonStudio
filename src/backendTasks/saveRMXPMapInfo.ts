import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import type { StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { Marshal, MarshalObject } from 'ts-marshal';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { parseJSON } from '@utils/json/parse';

export type SaveRMXPMapInfoInput = { projectPath: string; mapInfo: string; mapData: string };

type MapData = {
  dbSymbol: DbSymbol;
  name: string;
  id: number;
};

const backupMapInfo = async (projectPath: string, mapInfoRMXPFilePath: string) => {
  const backupFilePath = path.join(projectPath, 'Data', 'MapInfos.backup');
  if (fs.existsSync(backupFilePath)) return;

  return fsPromises.copyFile(mapInfoRMXPFilePath, backupFilePath);
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
  return new Map<MarshalObject, MarshalObject>(
    Object.values(mapInfo)
      .map((info) => {
        if (info.data.klass !== 'MapInfoMap') return undefined;
        const map = getMap(info.data.mapDbSymbol, mapData);
        if (!map) return undefined;

        return [
          map.id,
          {
            '@scroll_x': 0,
            '@name': map.name,
            '@expanded': info.isExpanded,
            '@order': orders[info.id],
            '@scroll_y': 0,
            '@parent_id': getParendId(mapInfo, info, mapData),
            __class: Symbol.for('RPG::MapInfo'),
          },
        ] as const;
      })
      .filter(<T>(v: T): v is Exclude<T, undefined> => !!v)
  );
};

const saveRMXPMapInfo = async (payload: SaveRMXPMapInfoInput) => {
  log.info('save-rmxp-map-info');
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  await backupMapInfo(payload.projectPath, mapInfoRMXPFilePath);
  const mapData: MapData[] = parseJSON(payload.mapData, mapInfoRMXPFilePath);
  const rmxpMapInfo = getRMXPMapInfo(parseJSON(payload.mapInfo, mapInfoRMXPFilePath), mapData);
  fs.writeFileSync(mapInfoRMXPFilePath, Marshal.dump(rmxpMapInfo, { omitStringEncoding: true }));
  log.info('save-rmxp-map-info/success');
  return {};
};

export const registerSaveRMXPMapInfo = defineBackendServiceFunction('save-rmxp-map-info', saveRMXPMapInfo);
