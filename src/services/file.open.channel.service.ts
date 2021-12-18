import { dialog, IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';

interface FileOpenParameters extends IpcRequest {
  name: string;
  extensions: string[];
}

const getFilePath = (name: string, extensions: string[]) =>
  dialog
    .showOpenDialog({ properties: ['openFile'], filters: [{ name, extensions }] })
    .then((result) => (result.filePaths[0] ? result.filePaths[0] : ''))
    .catch((err) => {
      log.error(err);
      return '';
    });

export default class FileOpenChannelService extends AbstractIpcChannel {
  channelName = 'file-open';

  async handle(event: IpcMainEvent, request: FileOpenParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    return getFilePath(request.name, request.extensions)
      .then((filePath) => {
        return event.sender.send(responseChannel, filePath ? { filePath } : { error: 'No file path returned' });
      })
      .catch(() => event.sender.send(responseChannel, { error: 'Failed to find file path' }));
  }
}
