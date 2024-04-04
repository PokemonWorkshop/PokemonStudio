import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import log from 'electron-log';

const HIDE_LAYERS = ['passages', 'systemtags', 'systemtags_bridge1', 'systemtags_bridge2', 'terrain_tag'] as const;

const getSpawnArgs = (mapPath: string, tiledOverviewPath: string): [string, string[]] => {
  const outputPath = `${path.join(tiledOverviewPath, path.basename(mapPath, '.tmx'))}.png`;
  const args = `${[`"${mapPath}"`, `"${outputPath}"`, ...HIDE_LAYERS.map((layer) => `--hide-layer ${layer}`)].join(' ')}`;
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `tmxrasterizer.exe ${args}`]];
  } else if (process.platform === 'linux') {
    return ['./tmxrasterizer', [args]];
  }
  return ['./tmxrasterizer', [args]];
};

export const createOverviewsFolder = async (projectPath: string) => {
  const tiledOverviewPath = path.join(projectPath, 'Data/Tiled/Overviews');
  if (!fs.existsSync(tiledOverviewPath)) await fsPromises.mkdir(tiledOverviewPath);
  return tiledOverviewPath;
};

export const generatingMapOverview = (mapPath: string, tiledOverviewPath: string, tiledExecPath: string) => {
  log.info('generating-map-overview', { mapPath });
  return new Promise<void>((resolve, reject) => {
    const child = spawn(...getSpawnArgs(mapPath, tiledOverviewPath), { cwd: path.dirname(tiledExecPath), shell: true });
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
