import log from 'electron-log';
import path from 'path';
import fsPromise from 'fs/promises';
import { isMarshalHash, isMarshalStandardObject, Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ReadRMXPMapInfoInput = { projectPath: string };
export type ReadRMXPMapInfoOutput = { rmxpMapInfo: { id: number; name: string }[] };

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

export const readRMXPMapInfo = async (mapInfoFilePath: string) => {
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

const readRMXPMapInfoBackendService = async (payload: ReadRMXPMapInfoInput): Promise<ReadRMXPMapInfoOutput> => {
  log.info('read-rmxp-map-info', payload);
  const mapInfoRMXPFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');

  const rmxpMapInfoData = await readRMXPMapInfo(mapInfoRMXPFilePath);
  log.info('read-rmxp-map-info/success');
  return { rmxpMapInfo: rmxpMapInfoData };
};

export const registerReadRMXPMapInfo = defineBackendServiceFunction('read-rmxp-map-info', readRMXPMapInfoBackendService);
