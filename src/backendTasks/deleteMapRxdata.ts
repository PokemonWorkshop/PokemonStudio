import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { padStr } from '@utils/PadStr';

/**
 * Fork-only backend task: delete a map's `Data/Map###.rxdata` (and its `.bak`)
 * when the map is deleted in Studio.
 *
 * Studio's map deletion removes the map from the project data and its `.tmx`,
 * but NOT the `.rxdata` — which is where the events live. Because that file is
 * keyed by the NUMERIC map id, a newly-created map that reuses a freed id would
 * otherwise inherit the deleted map's events (the reported bug: delete "tester"
 * (map 22), make a new map → it opens with the old event already on it).
 *
 * Path-locked to the project's `Data/` dir. A missing file is not an error — a
 * map that was never booted in PSDK has no `.rxdata` to begin with.
 */

export type DeleteMapRxdataInput = { projectPath: string; mapId: number };
export type DeleteMapRxdataOutput = { deleted: boolean };

export const deleteMapRxdata = async ({ projectPath, mapId }: DeleteMapRxdataInput): Promise<DeleteMapRxdataOutput> => {
  const dataDir = path.resolve(projectPath, 'Data');
  const filePath = path.resolve(dataDir, `Map${padStr(mapId, 3)}.rxdata`);
  // Refuse anything that escapes Data/ (a bad mapId can't wander off, but guard anyway).
  const rel = path.relative(dataDir, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw `deleteMapRxdata: refusing to delete outside Data/ (map ${mapId})`;

  let deleted = false;
  for (const target of [filePath, `${filePath}.bak`]) {
    if (fs.existsSync(target)) {
      await fsPromises.rm(target, { force: true });
      deleted = true;
    }
  }
  log.info('delete-map-rxdata', { mapId, deleted });
  return { deleted };
};

export const registerDeleteMapRxdata = defineBackendServiceFunction('delete-map-rxdata', deleteMapRxdata);
