import type { StudioMap } from '@modelEntities/map';
import uniq from 'lodash.uniq';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getTilesetImageAndAnimatedTiles } from 'ts-tiled-converter';

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

const saveMapsToProcess = async (projectDataPath: string, maps: StudioMap[]) => {
  const filename = path.join(projectDataPath, 'map_jobs.json');
  const previousMapToConvert = existsSync(filename) ? await readFile(filename) : Buffer.from('[]', 'utf8');
  const newData = uniq(maps.map(({ dbSymbol }) => dbSymbol).concat(JSON.parse(previousMapToConvert.toString('utf8'))));
  return writeFile(filename, JSON.stringify(newData));
};

export const processSavedMaps = async (projectDataPath: string, savedMaps: string[]) => {
  if (savedMaps.length === 0) return;

  const newSavedMaps = savedMaps.map((s) => JSON.parse(s) as StudioMap);
  if (newSavedMaps.some(({ tileMetadata }) => !tileMetadata)) return;

  await saveMapsToProcess(projectDataPath, newSavedMaps);
  const dbSymbolToFilterOut = newSavedMaps.map(({ dbSymbol }) => `dbSymbol: "${dbSymbol}"`);
  const filteredMaps = loadedMaps.filter((map) => !dbSymbolToFilterOut.some((d) => map.includes(d)));
  const filteredMapData = filteredMaps.map((s) => JSON.parse(s) as StudioMap).filter(({ tileMetadata }) => !!tileMetadata);
  const tilesets = uniq(
    newSavedMaps
      .concat(filteredMapData)
      .map(extractTileMetadata)
      .flatMap((m) => m.tileMetadata.tilesets.map(({ source }) => path.join(projectDataPath, MAP_PATH, m.dirname, source)))
  );

  const tiledFolder = path.join(projectDataPath, '../Tiled');

  const animatedTiles = tilesets.reduce((tilesByTileset, tilesetFilename) => {
    const name = tilesetFilename.replace(tiledFolder, '').slice(1);
    const tiles = getTilesetImageAndAnimatedTiles(tilesetFilename);

    if (!(tiles instanceof Error)) {
      tilesByTileset[name] = tiles;
    }
    return tilesByTileset;
  }, {} as Record<string, unknown>);

  await writeFile(path.join(projectDataPath, 'animated_tiles.json'), JSON.stringify(animatedTiles));

  setLoadedMaps(savedMaps.concat(filteredMaps));
};
