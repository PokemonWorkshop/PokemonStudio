import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import path from 'path';
import * as fs from 'fs';
import { readFiles } from '@services/project.loading.channel.service';

interface PSDKConfigsLoadingParameters extends IpcRequest {
  path: string;
}

export default class PSDKConfigsLoadingChannelService extends AbstractIpcChannel {
  channelName = 'psdk-configs-loading';

  async handle(event: IpcMainEvent, request: PSDKConfigsLoadingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    const configsPath = path.join(request.path, 'Data/configs');

    readFiles(
      configsPath,
      fs
        .readdirSync(configsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.json') && path.parse(dirent.name).name)
        .map((dirent) => dirent.name)
    )
      .then((r) =>
        event.sender.send(responseChannel, {
          projectConfig: Object.assign({}, r.configs),
        })
      )
      .catch((r) => {
        log.error(r);
        return event.sender.send(responseChannel, {
          error: `Failed to load psdk config data ${r}`,
        });
      });
  }
}
