import log from 'electron-log';

export type ChannelResponseFunctionType = (...responseArgs: unknown[]) => void;

export type SingleChannelRequest = {
  type: 'single-channel';
  args: unknown[];
  requestChannel: string;
  responseChannel: string;
  responseFunction: ChannelResponseFunctionType;
};

export type MultiChannelRequest = {
  type: 'multi-channel';
  args: unknown[];
  requestChannel: string;
  responseFunctions: Record<string, ChannelResponseFunctionType>;
};

export type ChannelRequest = SingleChannelRequest | MultiChannelRequest;

export class PSDKIpcService {
  private getIpcRenderer() {
    if (!window || !window.process || !window.require) {
      throw new Error(`Unable to require renderer process`);
    }
    return window.require('electron').ipcRenderer;
  }

  public send(request: ChannelRequest): void {
    const ipcRenderer = this.getIpcRenderer();

    ipcRenderer.send(request.requestChannel, ...request.args);

    log.debug(`Starting service ${request.requestChannel} with args ${JSON.stringify(request.args)}.`);

    if (request.type === 'single-channel') {
      ipcRenderer.removeAllListeners(request.responseChannel);
      ipcRenderer.on(request.responseChannel, (_, ...args) => request.responseFunction(...args));
    } else {
      Object.entries(request.responseFunctions).forEach(([responseChannel, responseFunction]) => {
        ipcRenderer.removeAllListeners(responseChannel);
        ipcRenderer.on(responseChannel, (_, ...args) => responseFunction(...args));
      });
    }
  }
}
