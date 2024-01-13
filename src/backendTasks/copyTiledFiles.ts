import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { MapToImport } from '@utils/useMapImport/types';
import path from 'path';
import { listResources } from 'ts-tiled-converter';
import { calculateFileSha1 } from './checkMapsModified';

export type CopyTiledFilesInput = { projectPath: string; tiledSrcPath: string; tiledMaps: string };
export type CopyTiledFilesOutput = { tiledMaps: string };

const MAPS_FOLDER = 'Data/Tiled/Maps';
const TILESETS_FOLDER = 'Data/Tiled/Tilesets';
const ASSETS_FOLDER = 'Data/Tiled/Assets';

const copyTmxFile = (tiledMap: MapToImport, mapsFolderPath: string, tiledSrcPath: string) => {
  const tiledFilePath = tiledMap.path;
  const relativePath = path.dirname(path.relative(tiledSrcPath, tiledFilePath));
  const destFolderPath = path.join(mapsFolderPath, relativePath);
  if (!fs.existsSync(destFolderPath)) {
    fs.mkdirSync(destFolderPath, { recursive: true });
  }
  const destPath = path.join(destFolderPath, path.basename(tiledFilePath));
  fs.copyFileSync(tiledFilePath, destPath);
  tiledMap.path = path.relative(mapsFolderPath, destPath).replaceAll('\\', '/').replaceAll('.tmx', '');
};

const copyTsxFile = (tiledMap: MapToImport, tilesetsFolderPath: string, tiledSrcPath: string) => {
  tiledMap.tileMetadata.tilesets.forEach((tileset) => {
    const tilesetPath = tileset.source;
    const filename = path.basename(tilesetPath);
    if (path.isAbsolute(tilesetPath)) {
      fs.copyFileSync(tilesetPath, path.join(tilesetsFolderPath, filename));
    } else {
      const absolutePath = path.join(path.dirname(path.join(tiledSrcPath, tiledMap.path)), tilesetPath);
      fs.copyFileSync(absolutePath, path.join(tilesetsFolderPath, filename));
    }
    tileset.source = path.join('../Tilesets', filename).replaceAll('\\', '/');
  });
};

const copyAssetFile = (tiledMap: MapToImport, assetsFolderPath: string, tiledSrcPath: string) => {
  const tmxFilePath = `${path.join(tiledSrcPath, tiledMap.path)}.tmx`;
  const resources = listResources(tmxFilePath, []);
  if (resources instanceof Error) {
    throw resources;
  }

  const assetSources = resources.assetSources;
  assetSources.forEach((asset) => {
    const assetPath = asset.pathIncludingMapDirname;
    const basename = path.basename(assetPath);
    if (path.isAbsolute(assetPath)) {
      fs.copyFileSync(assetPath, path.join(assetsFolderPath, basename));
    } else {
      const absolutePath = path.join(tiledSrcPath, assetPath);
      fs.copyFileSync(absolutePath, path.join(assetsFolderPath, basename));
    }
  });
};

const updateTmxFile = (tiledMap: MapToImport, mapsFolderPath: string, originalTiledMapPath: string) => {
  const tmxFilePath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;

  const resources = listResources(originalTiledMapPath, []);
  if (resources instanceof Error) {
    throw resources;
  }

  let data = fs.readFileSync(tmxFilePath).toString();
  const tilesetSources = resources.tilesetSources;
  tilesetSources.forEach((tileset) => {
    const basename = path.basename(tileset);
    data = data.replaceAll(`"${tileset}"`, `"../Tilesets/${basename}"`);
  });
  fs.writeFileSync(tmxFilePath, data);
};

const updateTsxFile = (tiledMap: MapToImport, mapsFolderPath: string, tilesetsFolderPath: string) => {
  const tmxFilePath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;

  const resources = listResources(tmxFilePath, []);
  if (resources instanceof Error) {
    throw resources;
  }

  const tilesetSources = resources.tilesetSources;
  const assetSources = resources.assetSources;
  tilesetSources.forEach((tileset) => {
    const tsxFilePath = path.join(tilesetsFolderPath, path.basename(tileset));
    let data = fs.readFileSync(tsxFilePath).toString();
    assetSources.forEach((asset) => {
      const basename = path.basename(asset.inTileset);
      data = data.replaceAll(`"${asset.inTileset}"`, `"../Assets/${basename}"`);
    });
    fs.writeFileSync(tsxFilePath, data);
  });
};

const updateMetadata = async (tiledMap: MapToImport, mapsFolderPath: string) => {
  const tmxPath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;
  const stat = fs.statSync(tmxPath);
  const sha1 = await calculateFileSha1(tmxPath);

  tiledMap.mtime = stat.mtime.getTime();
  tiledMap.sha1 = sha1;
};

const createTargetFolders = (mapsFolderPath: string, tilesetsFolderPath: string, assetsFolderPath: string) => {
  if (!fs.existsSync(mapsFolderPath)) {
    fs.mkdirSync(mapsFolderPath);
  }
  if (!fs.existsSync(tilesetsFolderPath)) {
    fs.mkdirSync(tilesetsFolderPath);
  }
  if (!fs.existsSync(assetsFolderPath)) {
    fs.mkdirSync(assetsFolderPath);
  }
};

const copyTiledFiles = async (payload: CopyTiledFilesInput) => {
  log.info('copy-tiled-files');
  const projectPath = payload.projectPath;
  const mapsFolderPath = path.join(projectPath, MAPS_FOLDER);
  const tilesetsFolderPath = path.join(projectPath, TILESETS_FOLDER);
  const assetsFolderPath = path.join(projectPath, ASSETS_FOLDER);

  createTargetFolders(mapsFolderPath, tilesetsFolderPath, assetsFolderPath);

  const tiledMaps: MapToImport[] = JSON.parse(payload.tiledMaps);
  const originalTiledMapPaths = tiledMaps.map(({ path }) => path);

  await tiledMaps.reduce(async (lastPromise, tiledMap, currentIndex) => {
    await lastPromise;

    log.info('copy-tiled-files/process', tiledMap.path);
    copyTmxFile(tiledMap, mapsFolderPath, payload.tiledSrcPath);
    copyTsxFile(tiledMap, tilesetsFolderPath, payload.tiledSrcPath);
    copyAssetFile(tiledMap, assetsFolderPath, payload.tiledSrcPath);
    updateTmxFile(tiledMap, mapsFolderPath, originalTiledMapPaths[currentIndex]);
    updateTsxFile(tiledMap, mapsFolderPath, tilesetsFolderPath);
    await updateMetadata(tiledMap, mapsFolderPath);
  }, Promise.resolve());

  log.info('copy-tiled-files/success', { projectPath: payload.projectPath, tiledSrcPath: payload.tiledSrcPath });
  return { tiledMaps: JSON.stringify(tiledMaps) };
};

export const registerCopyTiledFiles = defineBackendServiceFunction('copy-tiled-files', copyTiledFiles);
