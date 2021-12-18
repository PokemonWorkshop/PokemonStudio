import { IpcRenderer } from 'electron';
import log from 'electron-log';
import { IpcRequest } from './ipc.request';

export default class IpcService {
  private ipcRenderer?: IpcRenderer;

  private initializeIpcRenderer() {
    if (!window || !window.process || !window.require) {
      throw new Error(`Unable to require renderer process`);
    }
    this.ipcRenderer = window.require('electron').ipcRenderer;
  }

  public send<T>(channel: string, request: IpcRequest = {}): Promise<T> {
    // If the ipcRenderer is not available try to initialize it
    if (!this.ipcRenderer) {
      this.initializeIpcRenderer();
    }
    // If there's no responseChannel let's auto-generate it
    const responseChannel = request.responseChannel || `${channel}_response_${new Date().getTime()}`;
    request.responseChannel = responseChannel;

    const { ipcRenderer } = this;
    ipcRenderer?.send(channel, request);
    log.debug(`Starting service ${channel} with args ${JSON.stringify(request)}.`);

    // This method returns a promise which will be resolved when the response has arrived.
    return new Promise((resolve) => {
      ipcRenderer?.once(responseChannel, (_event, response) => resolve(response));
    });
  }
}
