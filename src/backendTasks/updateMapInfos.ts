import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { isMarshalHash, isMarshalStandardObject, Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type UpdateMapInfosInput = { projectPath: string };

const mustRMXPMapsBeUpdated = (mapInfoFilePath: string, rmxpMapFilePath: string) => {
  return fs.statSync(mapInfoFilePath).mtimeMs > fs.statSync(rmxpMapFilePath).mtimeMs;
};

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

const updateRMXPMaps = async (mapInfoFilePath: string, rmxpMapFilePath: string) => {
  const mapInfoData = await fsPromise.readFile(mapInfoFilePath);
  const marshalData = Marshal.load(mapInfoData);
  if (!isMarshalHash(marshalData)) throw new Error('Loaded object is not a Hash');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __class, __extendedModules, __default, ...mapInfos } = marshalData;
  const mapInfoRecords = Object.entries(mapInfos)
    .map(([id, data]) => (isMapInfoObject(data) ? { id: Number(id), order: data['@order'], name: data['@name'] } : undefined))
    .filter(<T>(data: T): data is Exclude<T, undefined> => !!data);
  const rmxpMapData = mapInfoRecords.sort((a, b) => a.order - b.order).map(({ id, name }) => ({ id, name }));
  await fsPromise.writeFile(rmxpMapFilePath, JSON.stringify(rmxpMapData, null, 2));
};

const updateMapInfos = async (payload: UpdateMapInfosInput) => {
  log.info('update-map-infos', payload);
  const mapInfoFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  const rmxpMapFilePath = path.join(payload.projectPath, 'Data', 'Studio', 'rmxp_maps.json');
  if (!mustRMXPMapsBeUpdated(mapInfoFilePath, rmxpMapFilePath)) {
    log.info('update-map-infos/success', 'Nothing to update');
    return {};
  }

  await updateRMXPMaps(mapInfoFilePath, rmxpMapFilePath);
  log.info('update-map-infos/success', 'Updated file');
  return {};
};

export const registerUpdateMapInfos = defineBackendServiceFunction('update-map-infos', updateMapInfos);
