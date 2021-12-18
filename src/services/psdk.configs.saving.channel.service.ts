import * as fs from 'fs';
import { IpcRequest } from '@services/IPC/ipc.request';
import AbstractIpcChannel from '@services/IPC/abstract.ipc.channel';
import { IpcMainEvent } from 'electron';
import path from 'path';
import log from 'electron-log';
import { SavingConfig } from '@utils/SavingUtils';

interface PSDKConfigsSavingParameters extends IpcRequest {
  path: string;
  configs: SavingConfig;
}

export default class PSDKConfigsSavingChannelService extends AbstractIpcChannel {
  channelName = 'psdk-configs-saving';

  async handle(event: IpcMainEvent, request: PSDKConfigsSavingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    const configsPath = path.join(request.path, 'Data/configs');

    Promise.all(
      request.configs.map(async (sd) => {
        const filePath = path.join(configsPath, sd.savingFilename + '.json');
        if (sd.savingAction === 'DELETE' && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else if (sd.data !== undefined) {
          fs.writeFileSync(filePath, sd.data);
        }
      })
    )
      .then(() => {
        return event.sender.send(responseChannel, {});
      })
      .catch((r) => {
        log.error(r);
        return event.sender.send(responseChannel, {
          error: `Failed to save psdk config data ${r}`,
        });
      });
  }
}
