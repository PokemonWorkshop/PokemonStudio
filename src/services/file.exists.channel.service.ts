import { IpcMainEvent } from 'electron';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import * as fs from 'fs';

interface FileExistsParameters extends IpcRequest {
  filePath: string;
}

export default class FileExistsChannelService extends AbstractIpcChannel {
  channelName = 'file-exists';

  async handle(event: IpcMainEvent, request: FileExistsParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    return event.sender.send(responseChannel, { fileExists: fs.existsSync(request.filePath) });
  }
}
