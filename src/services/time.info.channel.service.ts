import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';

/**
 *  Example of service that giving the current time
 */
export default class TimeInfoChannelService extends AbstractIpcChannel {
  channelName = 'time-info';

  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    if (!request.responseChannel) {
      request.responseChannel = `${this.name}_response`;
    }
    event.sender.send(request.responseChannel, {
      date: new Date().toString(),
    });
  }
}
