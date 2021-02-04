import { IpcMain, IpcMainEvent } from 'electron';
import { IpcRequest } from './ipc.request';

export default abstract class AbstractIpcChannel {
  channelName!: string;

  get name(): string {
    return this.channelName;
  }

  abstract handle(event: IpcMainEvent, request: IpcRequest): void;

  registerChannel(ipcMain: IpcMain): void {
    ipcMain.on(this.channelName, (event, request) =>
      this.handle(event, request)
    );
  }
}
