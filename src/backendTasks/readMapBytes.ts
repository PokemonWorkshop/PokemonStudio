import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned backend task.
 *
 * The renderer's wasm bridge can't read arbitrary disk files. This task gives
 * it a narrow on-ramp: read a single .tmx file from inside the project's
 * `Data/Tiled/Maps/` directory and return its bytes. The filename comes from
 * the Studio map record (`map.tiledFilename`) so it's always a known asset of
 * the open project — but we still resolve + sanity-check against the maps
 * directory before reading, so a malformed filename can't escape into
 * arbitrary file reads.
 */

export type ReadMapBytesInput = {
  projectPath: string;
  tiledFilename: string; // bare name without extension, as stored on StudioMap
};

export type ReadMapBytesOutput = {
  bytes: ArrayBuffer;
  size: number;
};

export const registerReadMapBytes = defineBackendServiceFunction(
  'read-map-bytes',
  async ({ projectPath, tiledFilename }: ReadMapBytesInput): Promise<ReadMapBytesOutput> => {
    const mapsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Maps');
    const target = path.resolve(mapsDir, `${tiledFilename}.tmx`);

    // Reject anything that resolved outside the maps directory — guards
    // against tiledFilename containing `..` or absolute path segments.
    const rel = path.relative(mapsDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`readMapBytes: refusing to read outside Data/Tiled/Maps (${tiledFilename})`);
    }

    const buf = await fs.promises.readFile(target);
    // Slice into a fresh ArrayBuffer so the renderer gets a clean detached
    // buffer (the Node Buffer's underlying ArrayBuffer is shared with the
    // pool and would otherwise transfer extra bytes via IPC).
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return { bytes: arrayBuffer, size: buf.byteLength };
  }
);
