import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { deletePSDKDatFile } from './migrateUtils';
import { parseJSON } from '@utils/json/parse';
import { MAP_LINK_VALIDATOR, StudioMapLink } from '../models/entities/mapLink';
import { MAP_VALIDATOR, StudioMap } from '../models/entities/map';
import { createMapLinkV2 } from '../utils/entityCreation';

export const addMissingMapLinks = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const mapLinksData = await readProjectFolder(projectPath, 'maplinks');
  const mapsData = await readProjectFolder(projectPath, 'maps');

  const mapLinks = mapLinksData.reduce<StudioMapLink[]>((prev, mapLink) => {
    const mapLinkParsed = MAP_LINK_VALIDATOR.safeParse(parseJSON<StudioMapLink>(mapLink.data, mapLink.filename));
    if (mapLinkParsed.success) return [...prev, mapLinkParsed.data];

    return prev;
  }, []);

  const maps = mapsData.reduce<StudioMap[]>((prev, map) => {
    const mapParsed = MAP_VALIDATOR.safeParse(parseJSON<StudioMap>(map.data, map.filename));
    if (mapParsed.success) return [...prev, mapParsed.data];

    return prev;
  }, []);

  await maps.reduce(async (lastPromise, map) => {
    await lastPromise;
    if (mapLinks.find((mapLink) => mapLink.mapId === map.id)) return;

    const allMapLinks = Object.fromEntries(mapLinks.map((mapLink) => [mapLink.dbSymbol, mapLink]));
    const newMapLink = createMapLinkV2(allMapLinks, map.id);
    mapLinks.push(newMapLink);
    return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/maplinks', `${newMapLink.dbSymbol}.json`), JSON.stringify(newMapLink, null, 2));
  }, Promise.resolve());
};
