import * as fs from 'fs';
import path from 'path';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import { SavingData } from '@utils/SavingUtils';

interface ProjectSavingParameters extends IpcRequest {
  path: string;
  data: SavingData;
}

export default class ProjectSavingChannelService extends AbstractIpcChannel {
  channelName = 'project-saving';

  async handle(event: IpcMainEvent, request: ProjectSavingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    const projectDataPath = path.join(request.path, 'Data/Studio/');

    // Ensure PSDK will rebuild the data
    const psdkDatPath = path.join(projectDataPath, 'psdk.dat');
    if (fs.existsSync(psdkDatPath)) fs.unlinkSync(psdkDatPath);

    Promise.all(
      request.data.map(async (sd) => {
        const filePath = path.join(projectDataPath, sd.savingPath + '.json');
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
          error: `Failed to save project data ${r}`,
        });
      });
  }
}
