import { parse } from 'csv-parse';
import log from 'electron-log';
import { createReadStream } from 'fs';
import path, { join } from 'path';
import { IpcRequest } from './IPC/ipc.request';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { ProjectText, projectTextKeys } from '../GlobalStateProvider';
import { IpcMainEvent } from 'electron';

interface TextLoadingParameters extends IpcRequest {
  path: string;
}

const loadCSV = async (textPath: string, id: keyof ProjectText): Promise<ProjectText> => {
  const data: ProjectText = {} as ProjectText;
  data[id] = [];
  return new Promise((resolve, reject) => {
    createReadStream(join(textPath, `${id}.csv`))
      .on('error', (err) => reject(`${id} ${err.message}`))
      .pipe(parse({ delimiter: ',' }))
      .on('data', (csvrow) => data[id].push(csvrow))
      .on('end', () => resolve(data));
  });
};

export default class TextLoadingChannelService extends AbstractIpcChannel {
  channelName = 'text-loading';

  async handle(event: IpcMainEvent, request: TextLoadingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;
    const projectTextPath = path.join(request.path, 'Data/Text/Dialogs');

    const result = await Promise.allSettled(projectTextKeys.map((id) => loadCSV(projectTextPath, id)));
    const hasError = result.some((r) => r.status === 'rejected');
    if (hasError) {
      log.error(
        'Failed to read csv files:',
        result.map((r) => r.status === 'rejected' && r.reason).filter((r) => !!r)
      );
      event.sender.send(responseChannel, {
        error: 'Some text files are missing',
      });
    } else {
      const allData = result.map((r) => r.status === 'fulfilled' && r.value).filter((r): r is ProjectText => !!r);
      event.sender.send(responseChannel, {
        projectText: Object.assign({}, ...allData),
      });
    }
  }
}
