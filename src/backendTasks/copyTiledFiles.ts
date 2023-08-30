import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { MapToImport } from '@utils/useMapImport/types';
import path from 'path';

export type CopyTiledFilesInput = { projectPath: string; tiledSrcPath: string; tiledMaps: string };
export type CopyTiledFilesOutput = { tiledMaps: string };

const MAPS_FOLDER = 'Data/Tiled/Maps';
const TILESETS_FOLDER = 'Data/Tiled/Tilesets';

const copyTmxFile = (tiledMap: MapToImport, mapsFolderPath: string, tiledSrcPath: string) => {
  const tiledFilePath = tiledMap.path;
  const relativePath = path.dirname(path.relative(tiledSrcPath, tiledFilePath));
  const destFolderPath = path.join(mapsFolderPath, relativePath);
  if (!fs.existsSync(destFolderPath)) {
    fs.mkdirSync(destFolderPath, { recursive: true });
  }
  const destPath = path.join(destFolderPath, path.basename(tiledFilePath));
  fs.copyFileSync(tiledFilePath, destPath);
  const stat = fs.statSync(destPath);
  tiledMap.path = path.relative(mapsFolderPath, destPath).replaceAll('\\', '/').replaceAll('.tmx', '');
  tiledMap.mtime = stat.mtime.getTime();
};

const copyTsxFile = (tiledMap: MapToImport, tilesetsFolderPath: string, tiledSrcPath: string) => {
  tiledMap.tileMetadata.tilesets.forEach((tileset) => {
    const tilesetPath = tileset.source;
    const filename = path.basename(tilesetPath);
    const filenamePng = filename.replaceAll('.tsx', '.png');
    if (path.isAbsolute(tilesetPath)) {
      fs.copyFileSync(tilesetPath, path.join(tilesetsFolderPath, filename));
      const pngPath = tilesetPath.replaceAll('.tsx', '.png');
      // TODO: improve the copy of the png file by reading the tsx file
      if (fs.existsSync(pngPath)) {
        fs.copyFileSync(pngPath, path.join(tilesetsFolderPath, filenamePng));
      }
      // TODO: update tilesets paths in the tmx file
    } else {
      const absolutePath = path.join(path.dirname(path.join(tiledSrcPath, tiledMap.path)), tilesetPath);
      const absolutePngPath = absolutePath.replaceAll('.tsx', '.png');
      fs.copyFileSync(absolutePath, path.join(tilesetsFolderPath, filename));
      // TODO: improve the copy of the png file by reading the tsx file
      if (fs.existsSync(absolutePngPath)) {
        fs.copyFileSync(absolutePngPath, path.join(tilesetsFolderPath, filenamePng));
      }
    }
    tileset.source = path.join('../Tilesets', filename).replaceAll('\\', '/');
  });
};

const copyTiledFiles = async (payload: CopyTiledFilesInput) => {
  log.info('copy-tiled-files');
  const projectPath = payload.projectPath;
  const mapsFolderPath = path.join(projectPath, MAPS_FOLDER);
  const tilesetsFolderPath = path.join(projectPath, TILESETS_FOLDER);

  if (!fs.existsSync(mapsFolderPath)) {
    fs.mkdirSync(mapsFolderPath);
  }
  if (!fs.existsSync(tilesetsFolderPath)) {
    fs.mkdirSync(tilesetsFolderPath);
  }

  const tiledMaps: MapToImport[] = JSON.parse(payload.tiledMaps);
  await tiledMaps.reduce(async (lastPromise, tiledMap) => {
    await lastPromise;
    copyTmxFile(tiledMap, mapsFolderPath, payload.tiledSrcPath);
    copyTsxFile(tiledMap, tilesetsFolderPath, payload.tiledSrcPath);
  }, Promise.resolve());

  log.info('copy-tiled-files/success', { projectPath: payload.projectPath, tiledSrcPath: payload.tiledSrcPath });
  return { tiledMaps: JSON.stringify(tiledMaps) };
};

export const registerCopyTiledFiles = defineBackendServiceFunction('copy-tiled-files', copyTiledFiles);
