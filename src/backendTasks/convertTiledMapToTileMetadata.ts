import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { PartialStudioMap, convertTiledMapToTileMetadata } from 'ts-tiled-converter';
import fs from 'fs';

export type ConvertTMXInput = { tmxPath: string };
export type ConvertTMXOutput = PartialStudioMap & { mtime: number };

export const registerConvertTiledMapToTileMetadata = defineBackendServiceFunction(
  'convertTiledMapToTileMetadata',
  async ({ tmxPath }: ConvertTMXInput) => {
    const result = convertTiledMapToTileMetadata(tmxPath);
    if (result instanceof Error) throw result;

    const mtime = fs.statSync(tmxPath).mtime.getTime();
    return { ...result, mtime };
  }
);
