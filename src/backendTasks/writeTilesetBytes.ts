import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Writes raw bytes back to a `.tsx` tileset file under
 * `Data/Tiled/Tilesets/`. Used by the animation editor — modifies the
 * XML directly (DOMParser + serialize) so we don't lose anything libtiled
 * doesn't round-trip.
 *
 * Atomic via temp-rename so a mid-write crash can't leave a truncated
 * .tsx. Path-locked to the Tilesets dir.
 */

export type WriteTilesetBytesInput = {
  projectPath: string;
  tsxFilename: string;
  bytes: ArrayBuffer;
};

export type WriteTilesetBytesOutput = {
  size: number;
  mtime: number;
};

export const registerWriteTilesetBytes = defineBackendServiceFunction(
  'write-tileset-bytes',
  async ({ projectPath, tsxFilename, bytes }: WriteTilesetBytesInput): Promise<WriteTilesetBytesOutput> => {
    const tilesetsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Tilesets');
    const target = path.resolve(tilesetsDir, tsxFilename);

    const rel = path.relative(tilesetsDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`writeTilesetBytes: refusing to write outside Data/Tiled/Tilesets (${tsxFilename})`);
    }

    const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
    const buf = Buffer.from(bytes);
    await fs.promises.writeFile(tmp, buf);
    await fs.promises.rename(tmp, target);
    const stat = await fs.promises.stat(target);
    return { size: buf.byteLength, mtime: stat.mtime.getTime() };
  },
);
