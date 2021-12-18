import * as fs from 'fs';
import { IpcRequest } from './IPC/ipc.request';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { app, IpcMainEvent } from 'electron';
import path from 'path';
import { getPSDKVersion } from './getPSDKVersion';

interface VersionParameters extends IpcRequest {
  path: string | null;
}

const readFile = async (versionPath: string) => {
  return fs.promises
    .readFile(versionPath, 'utf8')
    .then((content) => {
      return content;
    })
    .catch((e) => {
      log.error(e);
      return undefined;
    });
};

const convertPSDKVersion = (version: number) => {
  const p = (version % 256).toFixed(0);
  const a = (version / 256).toFixed(0);
  const b = (version / 65536).toFixed(0);
  const r = (version / 16_777_216).toFixed(0);
  const versionConverted: string[] = [];
  if (r !== '0') versionConverted.push(r.toString());
  if (b !== '0' || r !== '0') versionConverted.push(b.toString());
  versionConverted.push(a.toString());
  versionConverted.push(p.toString());
  return versionConverted.join('.');
};

export default class VersionsChannelService extends AbstractIpcChannel {
  channelName = 'versions';

  async handle(event: IpcMainEvent, request: VersionParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    const converted = convertPSDKVersion(getPSDKVersion().int);
    return event.sender.send(responseChannel, { psdkVersion: converted, studioVersion: app.getVersion() });
  }
}
