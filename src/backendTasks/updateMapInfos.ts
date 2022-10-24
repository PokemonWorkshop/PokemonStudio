import Electron, { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import Marshal from 'marshal';

const mustRMXPMapsBeUpdated = (mapInfoFilePath: string, rmxpMapFilePath: string) => {
  return fs.statSync(mapInfoFilePath).mtimeMs > fs.statSync(rmxpMapFilePath).mtimeMs;
};

type MapInfoData = Record<
  string,
  {
    '@scroll_x': number;
    '@name': string;
    '@expanded': boolean;
    '@order': number;
    '@scroll_y': number;
    '@parent_id': number;
    _name: 'RPG::MapInfo';
  }
>;

const updateRMXPMaps = async (mapInfoFilePath: string, rmxpMapFilePath: string) => {
  const mapInfoData = await fsPromise.readFile(mapInfoFilePath);
  const marshalData = new Marshal(mapInfoData);
  if (!marshalData.parsed) throw new Error('Failed to parse data');

  const mapInfos = marshalData.parsed as MapInfoData;
  const mapInfoRecords = Object.entries(mapInfos).map(([id, data]) => ({ id: Number(id), order: data['@order'], name: data['@name'] }));
  const rmxpMapData = mapInfoRecords.sort((a, b) => a.order - b.order).map(({ id, name }) => ({ id, name }));
  await fsPromise.writeFile(rmxpMapFilePath, JSON.stringify(rmxpMapData, null, 2));
};

const updateMapInfos = async (event: IpcMainEvent, payload: { projectPath: string }) => {
  log.info('update-map-infos', payload);
  const mapInfoFilePath = path.join(payload.projectPath, 'Data', 'MapInfos.rxdata');
  const rmxpMapFilePath = path.join(payload.projectPath, 'Data', 'Studio', 'rmxp_maps.json');
  if (!mustRMXPMapsBeUpdated(mapInfoFilePath, rmxpMapFilePath)) {
    log.info('update-map-infos/success', 'nothing to update');
    return event.sender.send('update-map-infos/success', {});
  }

  try {
    await updateRMXPMaps(mapInfoFilePath, rmxpMapFilePath);
    log.info('update-map-infos/success', 'updated file');
    event.sender.send('update-map-infos/success', {});
  } catch (error) {
    log.error('update-map-infos/failure', error);
    event.sender.send('update-map-infos/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerUpdateMapInfos = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('update-map-infos', updateMapInfos);
};
