import log from 'electron-log';
import fs from 'fs';
import fsPromises from 'fs/promises';
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

const getResources = (path: string) => {
  const resources = listResources(path, []);
  if (resources instanceof Error) {
    throw resources;
  }
  return resources;
};

const copyTmxFile = async (tiledMap: { path: string }, mapsFolderPath: string, tiledSrcPath: string) => {
  const tiledFilePath = tiledMap.path;
  const relativePath = path.dirname(path.relative(tiledSrcPath, tiledFilePath));
  const destFolderPath = path.join(mapsFolderPath, relativePath);
  if (!fs.existsSync(destFolderPath)) {
    await fsPromises.mkdir(destFolderPath, { recursive: true });
  }
  const destPath = path.join(destFolderPath, path.basename(tiledFilePath));
  if (!fs.existsSync(destPath)) {
    await fsPromises.copyFile(tiledFilePath, destPath);
  }
  tiledMap.path = path.relative(mapsFolderPath, destPath).replaceAll('\\', '/').replaceAll('.tmx', '');
};

const copyTsxFile = async (tiledMap: MapToImport, tilesetsFolderPath: string, tiledSrcPath: string) => {
  return tiledMap.tileMetadata.tilesets.reduce(async (lastPromise, tileset) => {
    await lastPromise;

    const tilesetPath = tileset.source;
    const filename = path.basename(tilesetPath);
    const destPath = path.join(tilesetsFolderPath, filename);
    if (!fs.existsSync(destPath)) {
      if (path.isAbsolute(tilesetPath)) {
        await fsPromises.copyFile(tilesetPath, destPath);
      } else {
        const absolutePath = path.join(path.dirname(path.join(tiledSrcPath, tiledMap.path)), tilesetPath);
        await fsPromises.copyFile(absolutePath, destPath);
      }
    }
    tileset.source = path.join('../Tilesets', filename).replaceAll('\\', '/');
  }, Promise.resolve());
};

const copyAssetFile = async (tiledMap: MapToImport, assetsFolderPath: string, tiledSrcPath: string) => {
  const tmxFilePath = `${path.join(tiledSrcPath, tiledMap.path)}.tmx`;
  const resources = getResources(tmxFilePath);

  return resources.assetSources.reduce(async (lastPromise, asset) => {
    await lastPromise;

    const assetPath = asset.pathIncludingMapDirname;
    const basename = path.basename(assetPath);
    const destPath = path.join(assetsFolderPath, basename);
    if (fs.existsSync(destPath)) return;

    if (path.isAbsolute(assetPath)) {
      await fsPromises.copyFile(assetPath, destPath);
    } else {
      const absolutePath = path.join(tiledSrcPath, assetPath);
      await fsPromises.copyFile(absolutePath, destPath);
    }
  }, Promise.resolve());
};

const updateTmxFile = async (tiledMap: { path: string }, mapsFolderPath: string, originalTiledMapPath: string) => {
  const tmxFilePath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;
  const resources = getResources(originalTiledMapPath);

  let data = (await fsPromises.readFile(tmxFilePath)).toString();
  resources.tilesetSources.forEach((tileset) => {
    const basename = path.basename(tileset);
    data = data.replaceAll(`"${tileset}"`, `"../Tilesets/${basename}"`);
  });
  await fsPromises.writeFile(tmxFilePath, data);
};

const updateTsxFile = async (tiledMap: MapToImport, mapsFolderPath: string, tilesetsFolderPath: string) => {
  const tmxFilePath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;
  const resources = getResources(tmxFilePath);

  return resources.tilesetSources.reduce(async (lastPromise, tileset) => {
    await lastPromise;

    const tsxFilePath = path.join(tilesetsFolderPath, path.basename(tileset));
    let data = (await fsPromises.readFile(tsxFilePath)).toString();
    resources.assetSources.forEach((asset) => {
      const basename = path.basename(asset.inTileset);
      data = data.replaceAll(`"${asset.inTileset}"`, `"../Assets/${basename}"`);
    });
    await fsPromises.writeFile(tsxFilePath, data);
  }, Promise.resolve());
};

const updateMetadata = async (tiledMap: MapToImport, mapsFolderPath: string) => {
  const tmxPath = `${path.join(mapsFolderPath, path.basename(tiledMap.path))}.tmx`;
  const stat = await fsPromises.stat(tmxPath);
  const sha1 = await calculateFileSha1(tmxPath);

  tiledMap.mtime = stat.mtime.getTime();
  tiledMap.sha1 = sha1;
};

const copyRulesFile = async (tiledSrcPath: string, mapsFolderPath: string) => {
  const rulesSrcPath = path.join(tiledSrcPath, 'rules.txt');
  const rulesDestPath = path.join(mapsFolderPath, 'rules.txt');
  if (!fs.existsSync(rulesSrcPath)) return;
  if (fs.existsSync(rulesDestPath)) return;

  log.info('copy-tiled-files/process', rulesSrcPath);
  await fsPromises.copyFile(rulesSrcPath, rulesDestPath);
  const rules = (await fsPromises.readFile(rulesDestPath)).toString();
  const lines = rules.split(/\r\n|\r|\n/);
  await lines.reduce(async (lastPromise, line) => {
    await lastPromise;
    if (line.startsWith('#')) return;

    const tiledMap = { path: path.join(tiledSrcPath, line) };
    await copyTmxFile(tiledMap, mapsFolderPath, tiledSrcPath);
    await updateTmxFile(tiledMap, mapsFolderPath, path.join(tiledSrcPath, line));
  }, Promise.resolve());
};

const createTargetFolders = async (mapsFolderPath: string, tilesetsFolderPath: string, assetsFolderPath: string) => {
  if (!fs.existsSync(mapsFolderPath)) {
    await fsPromises.mkdir(mapsFolderPath);
  }
  if (!fs.existsSync(tilesetsFolderPath)) {
    await fsPromises.mkdir(tilesetsFolderPath);
  }
  if (!fs.existsSync(assetsFolderPath)) {
    await fsPromises.mkdir(assetsFolderPath);
  }
};

const copyTiledFiles = async (payload: CopyTiledFilesInput) => {
  log.info('copy-tiled-files');
  const projectPath = payload.projectPath;
  const mapsFolderPath = path.join(projectPath, MAPS_FOLDER);
  const tilesetsFolderPath = path.join(projectPath, TILESETS_FOLDER);
  const assetsFolderPath = path.join(projectPath, ASSETS_FOLDER);

  await createTargetFolders(mapsFolderPath, tilesetsFolderPath, assetsFolderPath);

  const tiledMaps: MapToImport[] = JSON.parse(payload.tiledMaps);
  const originalTiledMapPaths = tiledMaps.map(({ path }) => path);

  await tiledMaps.reduce(async (lastPromise, tiledMap, currentIndex) => {
    await lastPromise;

    log.info('copy-tiled-files/process', tiledMap.path);
    await copyTmxFile(tiledMap, mapsFolderPath, payload.tiledSrcPath);
    await copyTsxFile(tiledMap, tilesetsFolderPath, payload.tiledSrcPath);
    await copyAssetFile(tiledMap, assetsFolderPath, payload.tiledSrcPath);
    await updateTmxFile(tiledMap, mapsFolderPath, originalTiledMapPaths[currentIndex]);
    await updateTsxFile(tiledMap, mapsFolderPath, tilesetsFolderPath);
    await updateMetadata(tiledMap, mapsFolderPath);
  }, Promise.resolve());

  await copyRulesFile(payload.tiledSrcPath, mapsFolderPath);

  log.info('copy-tiled-files/success', { projectPath: payload.projectPath, tiledSrcPath: payload.tiledSrcPath });
  return { tiledMaps: JSON.stringify(tiledMaps) };
};

export const registerCopyTiledFiles = defineBackendServiceFunction('copy-tiled-files', copyTiledFiles);
