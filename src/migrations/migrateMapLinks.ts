import { IpcMainEvent } from 'electron';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import { isMarshalHash, Marshal } from 'ts-marshal';

const deletePSDKDatFile = (projectPath: string) => {
  const psdkDatFilePath = path.join(projectPath, 'Data', 'Studio', 'psdk.dat');
  if (fs.existsSync(psdkDatFilePath)) fs.unlinkSync(psdkDatFilePath);
};

const loadMapLinkData = async (projectPath: string): Promise<[string, number[]][]> => {
  const mapLinkFilename = path.join(projectPath, 'Data', 'PSDK', 'Maplinks.rxdata');
  const fileData = await fsPromise.readFile(mapLinkFilename);
  const object = Marshal.load(fileData);
  if (!isMarshalHash(object)) throw new Error('Maplinks.rxdata does not contain a Hash');

  const unwantedKeys = ['__class', '__default', '__extendedModules'];
  return Object.entries(object).filter(
    (record): record is [string, number[]] =>
      !unwantedKeys.includes(record[0]) && Array.isArray(record[1]) && record[1].every((v) => typeof v === 'number')
  );
};

type MapLinkMap = { mapId: number; offset: number };
type MapLink = {
  klass: 'MapLink';
  id: number;
  dbSymbol: string;
  mapId: number;
  northMaps: MapLinkMap[];
  eastMaps: MapLinkMap[];
  southMaps: MapLinkMap[];
  westMaps: MapLinkMap[];
};

const makeMapLinkMaps = (input: number[], baseOffset: number): MapLinkMap[] => {
  if (input[baseOffset] === 0 || input[baseOffset] === undefined) return [];

  return Array.from({ length: Math.floor(input.length / 8 + 0.875) }, (_, i) => i * 8)
    .map((aryOffset) => {
      const mapId = input[aryOffset + baseOffset];
      if (mapId === 0 || mapId === undefined) return undefined;
      const offset = Number(input[aryOffset + baseOffset + 1] || 0);
      return { mapId, offset };
    })
    .filter(<T>(v: T): v is Exclude<T, undefined> => !!v);
};

const makeMapLinkData = (input: Awaited<ReturnType<typeof loadMapLinkData>>): MapLink[] => {
  if (input.length === 0)
    return [
      {
        klass: 'MapLink',
        id: 0,
        dbSymbol: 'maplink_0',
        mapId: 0,
        northMaps: [],
        eastMaps: [],
        southMaps: [],
        westMaps: [],
      },
    ];

  return input.map(([mapIdString, disposition], id) => {
    const mapId = Number(mapIdString);
    return {
      klass: 'MapLink',
      id,
      dbSymbol: `maplink_${id}`,
      mapId,
      northMaps: makeMapLinkMaps(disposition, 0),
      eastMaps: makeMapLinkMaps(disposition, 2),
      southMaps: makeMapLinkMaps(disposition, 4),
      westMaps: makeMapLinkMaps(disposition, 6),
    };
  });
};

export const migrateMapLinks = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);
  const psdkData = await loadMapLinkData(projectPath);
  const mapLinks = makeMapLinkData(psdkData);
  const mapLinksFolder = path.join(projectPath, 'Data', 'Studio', 'maplinks');
  if (!fs.existsSync(mapLinksFolder)) fs.mkdirSync(mapLinksFolder);

  await mapLinks.reduce(async (lastPromise, mapLink) => {
    await lastPromise;
    return fsPromise.writeFile(path.join(mapLinksFolder, `${mapLink.dbSymbol}.json`), JSON.stringify(mapLink, null, 2));
  }, Promise.resolve());
};
