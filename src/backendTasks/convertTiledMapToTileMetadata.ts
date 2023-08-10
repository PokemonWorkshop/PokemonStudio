import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { convertTiledMapToTileMetadata } from 'ts-tiled-converter';

export type ConvertTMXInput = { tmxPath: string };

export const registerConvertTiledMapToTileMetadata = defineBackendServiceFunction(
  'convertTiledMapToTileMetadata',
  async ({ tmxPath }: ConvertTMXInput) => {
    const result = convertTiledMapToTileMetadata(tmxPath);
    if (result instanceof Error) throw result;

    return result;
  }
);
