import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { StudioMap } from '@modelEntities/map';
import type { DbSymbol } from '@modelEntities/dbSymbol';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type CheckMapsModifiedMethod = 'mtime' | 'sha1';

const calculateFileSha1 = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const stream = fs.createReadStream(filePath, 'utf8');

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      const sha1 = hash.digest('hex');
      resolve(sha1);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

const getFileStats = (filePath: string): Promise<fs.Stats> => {
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
  const studioMaps: StudioMap[] = payload.maps.map((map) => JSON.parse(map));

  const tiledMapPath = path.join(payload.projectPath, 'data/tiled');

  const mapsModified = await studioMaps.reduce(async (accPromise, map) => {
    const acc = await accPromise;
    const filePath = path.join(tiledMapPath, map.tiledFilename + '.tmx');
    if (!fs.existsSync(filePath)) return acc;

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
