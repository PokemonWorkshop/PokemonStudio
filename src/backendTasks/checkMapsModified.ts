import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import type { DbSymbol } from '@modelEntities/dbSymbol';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { Sha1 } from '@modelEntities/sha1';
import { calculateFileSha1 } from './calculateFileSha1';

export type CheckMapsModifiedMethod = 'mtime' | 'sha1';
type StudioMapBackend = {
  dbSymbol: DbSymbol;
  mtime: number;
  sha1: Sha1;
  tiledFilename: string;
};

export const getFileStats = (filePath: string): Promise<fs.Stats> => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

export type CheckMapModifiedInput = { projectPath: string; maps: string[]; method: CheckMapsModifiedMethod };
export type CheckMapModifiedOutput = Awaited<ReturnType<typeof checkMapsModified>>;

export const checkMapsModified = async (payload: CheckMapModifiedInput) => {
  log.info('check-maps-modified', { method: payload.method });
  const studioMaps: StudioMapBackend[] = payload.maps.map((map) => JSON.parse(map));

  const tiledMapPath = path.join(payload.projectPath, 'Data/Tiled/Maps');

  const mapsModified = await studioMaps.reduce(async (accPromise, map) => {
    const acc = await accPromise;
    const filePath = path.join(tiledMapPath, map.tiledFilename + '.tmx');
    if (map.tiledFilename === '' || !fs.existsSync(filePath)) return acc;

    if (payload.method === 'sha1') {
      try {
        const sha1 = await calculateFileSha1(filePath);
        if (sha1 !== map.sha1) {
          return [...acc, map.dbSymbol];
        } else {
          return acc;
        }
      } catch (error) {
        log.error('SHA-1 calculation error', error);
        return acc;
      }
    } else {
      const stat = await getFileStats(filePath);
      if (stat.mtime.getTime() !== map.mtime) {
        return [...acc, map.dbSymbol];
      } else {
        return acc;
      }
    }
  }, Promise.resolve([] as DbSymbol[]));
  log.info('check-maps-modified/success', { dbSymbols: mapsModified });
  return { dbSymbols: mapsModified };
};

export const registerCheckMapsModified = defineBackendServiceFunction('check-maps-modified', checkMapsModified);
