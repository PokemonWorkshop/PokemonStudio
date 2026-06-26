import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Companion to `readMapBytes` — takes bytes from the renderer's
 * wasm bridge and writes them to `Data/Tiled/Maps/<filename>.tmx`.
 *
 * Atomic write via temp file + rename so a crash mid-write can't leave a
 * truncated .tmx on disk. Returns the new mtime so the renderer can refresh
 * Studio's cache without an extra stat call.
 *
 * Path-locked to the maps directory (same defense as readMapBytes).
 */

export type WriteMapBytesInput = {
  projectPath: string;
  tiledFilename: string;
  bytes: ArrayBuffer;
};

export type WriteMapBytesOutput = {
  size: number;
  mtime: number;
};

export const registerWriteMapBytes = defineBackendServiceFunction(
  'write-map-bytes',
  async ({ projectPath, tiledFilename, bytes }: WriteMapBytesInput): Promise<WriteMapBytesOutput> => {
    const mapsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Maps');
    const target = path.resolve(mapsDir, `${tiledFilename}.tmx`);

    const rel = path.relative(mapsDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`writeMapBytes: refusing to write outside Data/Tiled/Maps (${tiledFilename})`);
    }

    const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
    const buf = Buffer.from(bytes);
    await fs.promises.writeFile(tmp, buf);
    await fs.promises.rename(tmp, target);
    const stat = await fs.promises.stat(target);
    return { size: buf.byteLength, mtime: stat.mtime.getTime() };
  },
);
