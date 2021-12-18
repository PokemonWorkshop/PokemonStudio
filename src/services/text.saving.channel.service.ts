import log from 'electron-log';
import path from 'path';
import { IpcRequest } from './IPC/ipc.request';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { ProjectText, projectTextKeys } from '../GlobalStateProvider';
import { IpcMainEvent } from 'electron';
import * as fs from 'fs';
import { stringify } from 'csv-stringify/sync';

interface TextSavingParameters extends IpcRequest {
  path: string;
  projectTextSave: boolean[];
  projectText: string;
}

export default class TextSavingChannelService extends AbstractIpcChannel {
  channelName = 'text-saving';

  async handle(event: IpcMainEvent, request: TextSavingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;
    const projectTextPath = path.join(request.path, 'Data/Text/Dialogs');

    const projectText = JSON.parse(request.projectText) as ProjectText;
    Promise.all(
      request.projectTextSave.map(async (b, i) => {
        if (b) {
          const file = projectTextKeys[i];
          const filePath = path.join(projectTextPath, file.toString() + '.csv');
          fs.writeFileSync(filePath, stringify(projectText[file]));
        }
      })
    )
      .then(() => {
        return event.sender.send(responseChannel, {});
      })
      .catch((r) => {
        log.error(r);
        return event.sender.send(responseChannel, {
          error: `Failed to save project text data ${r}`,
        });
      });
  }
}
