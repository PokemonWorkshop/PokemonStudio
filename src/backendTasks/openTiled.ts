import log from 'electron-log';
import { execFile } from 'child_process';
import path from 'path';
import util from 'util';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type OpenTiledPayload = {
  tiledPath: string;
  projectPath: string;
  tiledMapFilename: string;
};

const openTiled = async (payload: OpenTiledPayload) => {
  log.info('open-tiled', payload);
  const mapFilename = path.join(payload.projectPath, 'Data', 'Tiled', 'Maps', payload.tiledMapFilename + '.tmx');
  await util.promisify(execFile)(payload.tiledPath, [mapFilename]);
  return {};
};

export const registerOpenTiled = defineBackendServiceFunction('open-tiled', openTiled);
