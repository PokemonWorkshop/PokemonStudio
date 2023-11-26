import type { StudioMap } from '@modelEntities/map';
import uniq from 'lodash.uniq';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getTilesetImageAndAnimatedTiles } from 'ts-tiled-converter';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

let loadedMaps: string[] = [];
const MAP_PATH = '../Tiled/Maps';

export const setLoadedMaps = (maps: string[]) => {
  loadedMaps = maps;
};

type PartialTiledMapMetadata = {
  tilesets: {
    firstGlobalId: number;
    source: string;
  }[];
};

const extractTileMetadata = ({ tileMetadata, tiledFilename }: StudioMap) => ({
  dirname: path.dirname(tiledFilename),
  tileMetadata: tileMetadata as PartialTiledMapMetadata,
});

const createJobDirIfNotExist = async (tiledFolder: string) => {
  const jobsDir = path.join(tiledFolder, '.jobs');
  if (!existsSync(jobsDir)) {
    await mkdir(jobsDir, { recursive: true });
  }
};

const saveMapsToProcess = async (tiledFolder: string, maps: StudioMap[]) => {
  const filename = path.join(tiledFolder, '.jobs/map_jobs.json');
  const previousMapToConvert = existsSync(filename) ? await readFile(filename) : Buffer.from('[]', 'utf8');
  const newData = uniq(maps.map(({ dbSymbol }) => dbSymbol).concat(JSON.parse(previousMapToConvert.toString('utf8'))));
  return writeFile(filename, JSON.stringify(newData));
};

const filterOutMaps = (newSavedMaps: StudioMap[]) => {
  const dbSymbolToFilterOut = newSavedMaps.map(({ dbSymbol }) => `dbSymbol: "${dbSymbol}"`);
  return loadedMaps.filter((map) => !dbSymbolToFilterOut.some((d) => map.includes(d)));
};

const getAllMapTilesets = (projectDataPath: string, filteredMaps: string[], newSavedMaps: StudioMap[]) => {
  const filteredMapData = filteredMaps.map((s) => JSON.parse(s) as StudioMap).filter(({ tileMetadata }) => !!tileMetadata);
  return uniq(
    newSavedMaps
      .concat(filteredMapData)
      .map(extractTileMetadata)
      .flatMap((m) => m.tileMetadata.tilesets.map(({ source }) => path.join(projectDataPath, MAP_PATH, m.dirname, source).replaceAll('\\', '/')))
  );
};

const buildAnimatedTilesRecord = (tiledFolder: string, tilesets: string[]) =>
  tilesets.reduce((tilesByTileset, tilesetFilename) => {
    const name = tilesetFilename.replace(tiledFolder, '').slice(1);
    const tiles = getTilesetImageAndAnimatedTiles(tilesetFilename);

    if (!(tiles instanceof Error)) {
      tilesByTileset[name] = {
        animatedTiles: tiles.animatedTiles,
        assetSourceInTileset: tiles.assetSource.inTileset,
        transparency: tiles.assetSource.transparency || null,
      };
    }
    return tilesByTileset;
  }, {} as Record<string, unknown>);

export const processSavedMaps = async (projectDataPath: string, savedMaps: string[]) => {
  try {
    if (savedMaps.length === 0) return;

    const newSavedMaps = savedMaps.map((s) => JSON.parse(s) as StudioMap);
    if (newSavedMaps.some(({ tileMetadata }) => !tileMetadata)) return;

    const filteredMaps = filterOutMaps(newSavedMaps);
    const tilesets = getAllMapTilesets(projectDataPath, filteredMaps, newSavedMaps);
    const tiledFolder = path.join(projectDataPath, '../Tiled').replaceAll('\\', '/');
    const animatedTiles = buildAnimatedTilesRecord(tiledFolder, tilesets);

    await createJobDirIfNotExist(tiledFolder);
    await saveMapsToProcess(tiledFolder, newSavedMaps);
    await writeFile(path.join(tiledFolder, '.jobs/animated_tiles.json'), JSON.stringify(animatedTiles));

    setLoadedMaps(savedMaps.concat(filteredMaps));
  } catch (e) {
    log.error('Error while saving StudioMap to RMXP conversion jobs', e);
    const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
    // This message is not awaited because for some reasons its showing again and again when awaited (wtf?)
    // In any case, under Microsoft Windows, the MessageBox is child of the main Window so until the user presses OK
    // the main Window is not accepting any user input :)
    dialog.showMessageBox(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      title: 'Map conversion job error',
      message: `Failed to save StudioMap to RMXP conversion jobs: \n${errorMessage}`,
      type: 'error',
    });
    // Note: For UX reason I decided not to block saving if the jobs cannot be saved because jobs can still be crafted easily, lost data is harder to craft.
  }
};
