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
  if (process.platform === 'darwin') {
    await util.promisify(execFile)('open', [payload.tiledPath, mapFilename]);
  } else if (process.platform === 'linux') {
    const linuxMapFilename = path.basename(mapFilename);
    const defaultDir = process.cwd();
    process.chdir(path.dirname(mapFilename));
    if (payload.tiledPath.endsWith('AppImage') && linuxMapFilename.indexOf(' ') !== -1) {
      throw new Error("Tiled's AppImage doesn't support spaces in map names.");
    }
    const result = await util.promisify(execFile)(payload.tiledPath, [`"${linuxMapFilename}"`]);
    if (result.stderr) log.error(result.stderr);
    process.chdir(defaultDir);
  } else {
    await util.promisify(execFile)(payload.tiledPath, [mapFilename]);
  }
  return {};
};

export const registerOpenTiled = defineBackendServiceFunction('open-tiled', openTiled);
