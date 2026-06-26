import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Reads the raw bytes of a single `.tsx` tileset file from
 * `Data/Tiled/Tilesets/`. Used by the animation editor so it can mutate
 * the XML directly (preserving anything libtiled doesn't round-trip
 * cleanly — properties, terrain, wangsets, formatting, etc.) instead of
 * re-emitting from parsed JSON.
 *
 * Companion to `writeTilesetBytes`. Path-locked to the Tilesets dir.
 */

export type ReadTilesetBytesInput = {
  projectPath: string;
  /** Filename WITH extension, e.g. "Autotiles.tsx". */
  tsxFilename: string;
};

export type ReadTilesetBytesOutput = {
  bytes: ArrayBuffer;
  mtime: number;
};

export const registerReadTilesetBytes = defineBackendServiceFunction(
  'read-tileset-bytes',
  async ({ projectPath, tsxFilename }: ReadTilesetBytesInput): Promise<ReadTilesetBytesOutput> => {
    const tilesetsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Tilesets');
    const target = path.resolve(tilesetsDir, tsxFilename);

    const rel = path.relative(tilesetsDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`readTilesetBytes: refusing to read outside Data/Tiled/Tilesets (${tsxFilename})`);
    }

    const buf = await fs.promises.readFile(target);
    const stat = await fs.promises.stat(target);
    // Slice the underlying ArrayBuffer to exactly the file's length —
    // Node's Buffer can carry a longer-than-needed ArrayBuffer.
    return {
      bytes: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      mtime: stat.mtime.getTime(),
    };
  },
);
