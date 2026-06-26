import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Reads raw bytes of a tileset's image (PNG/JPG/etc.) from
 * `Data/Tiled/Assets/`. Used by the New Map dialog's tileset preview —
 * we can't use `file://` URLs from the renderer (webSecurity blocks
 * cross-scheme loads), so we hand the bytes through IPC and the
 * renderer turns them into a blob: URL.
 *
 * Path-locked to the Assets dir.
 */

export type ReadTilesetImageBytesInput = {
  projectPath: string;
  /** Filename WITH extension, e.g. "passages.png". */
  imageFilename: string;
};

export type ReadTilesetImageBytesOutput = {
  bytes: ArrayBuffer;
};

export const registerReadTilesetImageBytes = defineBackendServiceFunction(
  'read-tileset-image-bytes',
  async ({ projectPath, imageFilename }: ReadTilesetImageBytesInput): Promise<ReadTilesetImageBytesOutput> => {
    const assetsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Assets');
    const target = path.resolve(assetsDir, imageFilename);

    const rel = path.relative(assetsDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`readTilesetImageBytes: refusing to read outside Data/Tiled/Assets (${imageFilename})`);
    }

    const buf = await fs.promises.readFile(target);
    return {
      bytes: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    };
  },
);
