import { IpcMain, IpcMainEvent } from 'electron';

export abstract class PSDKAbstractIpcChannel {
  channelName!: string;

  get name(): string {
    return this.channelName;
  }

  abstract handle(event: IpcMainEvent, ...args: unknown[]): void;

  registerChannel(ipcMain: IpcMain): void {
    ipcMain.on(this.channelName, (event, ...args) => this.handle(event, ...args));
  }
}
