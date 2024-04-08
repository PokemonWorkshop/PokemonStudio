import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type GeneratingMapOverviewInput = {
  tiledFilename: string;
  projectPath: string;
  tiledExecPath: string;
};

const HIDE_LAYERS = ['passages', 'systemtags', 'systemtags_bridge1', 'systemtags_bridge2', 'terrain_tag'] as const;

const getSpawnArgs = (tiledExecPath: string, tmxPath: string, tiledOverviewPath: string): [string, string[]] => {
  const outputPath = `${path.join(tiledOverviewPath, path.basename(tmxPath, '.tmx'))}.png`;
  const args = `${[`"${tmxPath}"`, `"${outputPath}"`, ...HIDE_LAYERS.map((layer) => `--hide-layer ${layer}`)].join(' ')}`;
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `tmxrasterizer.exe ${args}`]];
  } else if (process.platform === 'linux' && !tiledExecPath.toLowerCase().endsWith('appimage')) {
    return ['./tmxrasterizer', [args]];
  } else if (process.platform === 'darwin') {
    return [`./${path.basename(tiledExecPath)}/Contents/MacOS/tmxrasterizer`, [args]];
  }
  return [`./${path.basename(tiledExecPath)}`, ['tmxrasterizer', args]];
};

export const createOverviewsFolder = async (projectPath: string) => {
  const tiledOverviewPath = path.join(projectPath, 'Data/Tiled/Overviews');
  if (!fs.existsSync(tiledOverviewPath)) await fsPromises.mkdir(tiledOverviewPath);
  return tiledOverviewPath;
};

export const generatingMapOverview = (tmxPath: string, tiledOverviewPath: string, tiledExecPath: string) => {
  log.info('generating-map-overview', { tmxPath });
  return new Promise<void>((resolve, reject) => {
    const child = spawn(...getSpawnArgs(tiledExecPath, tmxPath, tiledOverviewPath), { cwd: path.dirname(tiledExecPath), shell: true });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const errMessage = `An error occurred during overview generation (exit code: ${code})`;
        log.error(errMessage);
        reject(new Error(errMessage));
      }
    });
  });
};

export const generatingMapOverviewService = async (payload: GeneratingMapOverviewInput) => {
  log.info('generating-map-overview-service', payload);
  const tmxPath = path.join(payload.projectPath, 'Data/Tiled/Maps', `${path.basename(payload.tiledFilename, '.tmx')}.tmx`);
  const tiledOverviewPath = path.join(payload.projectPath, 'Data/Tiled/Overviews');
  await createOverviewsFolder(payload.projectPath);
  await generatingMapOverview(tmxPath, tiledOverviewPath, payload.tiledExecPath);
  return {};
};

export const registerGeneratingMapOverview = defineBackendServiceFunction('generating-map-overview', generatingMapOverviewService);
