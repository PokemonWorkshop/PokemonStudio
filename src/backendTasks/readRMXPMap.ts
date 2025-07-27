import log from 'electron-log';
import path from 'path';
import fsPromise from 'fs/promises';
import { isMarshalStandardObject, Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { padStr } from '@utils/PadStr';
import { addAudioExtensionFile, isRecord, type AudioData, type RMXPAudio } from '@utils/rmxpUtils';

export type ReadRMXPMapInput = { projectPath: string; mapId: number };
export type ReadRMXPMapOutput = { rmxpMapData: RMXPMap };

export type RMXPMap = {
  encounterStep: number;
  autoplayBgm: boolean;
  bgm: RMXPAudio;
  autoplayBgs: boolean;
  bgs: RMXPAudio;
};

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
  '@events': unknown[];
};

export const isMapObject = (object: unknown): object is MapData =>
  isMarshalStandardObject(object) &&
  '@autoplay_bgm' in object &&
  '@bgm' in object &&
  '@autoplay_bgs' in object &&
  '@bgs' in object &&
  '@encounter_step' in object &&
  '@events' in object &&
  typeof object['@autoplay_bgm'] === 'boolean' &&
  typeof object['@bgm'] === 'object' &&
  typeof object['@autoplay_bgs'] === 'boolean' &&
  typeof object['@bgs'] === 'object' &&
  typeof object['@encounter_step'] === 'number' &&
  typeof object['@events'] === 'object';

export const readRMXPMap = async (projectPath: string, mapId: number): Promise<RMXPMap | undefined> => {
  const mapData = await fsPromise.readFile(path.join(projectPath, 'Data', `Map${padStr(mapId, 3)}.rxdata`));
  const marshalData = Marshal.load(mapData);
  if (!isRecord(marshalData)) throw new Error('Loaded object is not a Record');

  if (!isMapObject(marshalData)) return undefined;

  return {
    encounterStep: marshalData['@encounter_step'],
    autoplayBgm: marshalData['@autoplay_bgm'],
    bgm: {
      name: addAudioExtensionFile(projectPath, marshalData['@bgm']['@name'], 'bgm'),
      pitch: marshalData['@bgm']['@pitch'],
      volume: marshalData['@bgm']['@volume'],
    },
    autoplayBgs: marshalData['@autoplay_bgs'],
    bgs: {
      name: addAudioExtensionFile(projectPath, marshalData['@bgs']['@name'], 'bgs'),
      pitch: marshalData['@bgs']['@pitch'],
      volume: marshalData['@bgs']['@volume'],
    },
  };
};

const readRMXPMapBackendService = async (payload: ReadRMXPMapInput): Promise<ReadRMXPMapOutput> => {
  log.info('read-rmxp-map', payload);
  const rmxpMapData = await readRMXPMap(payload.projectPath, payload.mapId);
  if (!rmxpMapData) {
    throw new Error(`The file Map${padStr(payload.mapId, 3)} is not a valid map object.`);
  }
  log.info('read-rmxp-map/success');
  return { rmxpMapData };
};

export const registerReadRMXPMap = defineBackendServiceFunction('read-rmxp-map', readRMXPMapBackendService);
