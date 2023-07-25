import type { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { BackendTaskFunctionInput, ChannelNames, sendFailure, sendSuccess } from '@utils/BackendTask';

type AnyObject = Record<string, unknown>;

export const defineBackendServiceFunction =
  <InputPayload extends AnyObject, OutputPayload extends AnyObject>(
    serviceName: string,
    serviceFunction: (payload: InputPayload, event: IpcMainEvent, channels: ChannelNames) => Promise<OutputPayload>
  ) =>
  (ipcMain: IpcMain) =>
    ipcMain.on(serviceName, async (event: IpcMainEvent, { channels, payload }: BackendTaskFunctionInput<InputPayload>) => {
      try {
        const output = await serviceFunction(payload, event, channels);
        sendSuccess(event, channels, output);
      } catch (error) {
        log.error(`${serviceName}/failure`, error);
        sendFailure(event, channels, error);
      }
    });
