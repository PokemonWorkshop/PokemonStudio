import Marshal from 'marshal';
import zlib from 'zlib';
import fs from 'fs/promises';
import { IpcMainEvent } from 'electron';
import { PSDKAbstractIpcChannel } from './psdk.abstract.ipc.channel';

/**
 *  Service decoding scripts downloaded for update (mega_script.deflate)
 */
export class PSDKDecodeDownloadedScriptsChannelService extends PSDKAbstractIpcChannel {
  channelName = 'psdk-decode-downloaded-scripts';

  async handle(event: IpcMainEvent, scriptPath: string, fromMemory: boolean): Promise<void> {
    try {
      const filedata = fromMemory ? scriptPath : await fs.readFile(scriptPath);
      const data = zlib.inflateSync(filedata);
      const marshalData = new Marshal(data);
      if (marshalData.parsed) {
        event.sender.send('psdk-decode-downloaded-scripts.result', JSON.stringify({ data: marshalData.parsed }));
      } else {
        event.sender.send('psdk-decode-downloaded-scripts.result', JSON.stringify({ error: 'Failed to parse marshal data', name: 'MarshalError' }));
      }
    } catch (error) {
      if (error instanceof Error) {
        event.sender.send('psdk-decode-downloaded-scripts.result', JSON.stringify({ error: error.message, name: error.name }));
      } else {
        event.sender.send('psdk-decode-downloaded-scripts.result', JSON.stringify({ error: 'unknown error', name: 'unknown' }));
      }
    }
  }
}
