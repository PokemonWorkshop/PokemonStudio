import * as fs from 'fs';
import path from 'path';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import PSDKEntity from '../models/entities/PSDKEntity';

interface ProjectLoadingParameters extends IpcRequest {
  path: string;
}

export const readFiles = async (dir: string, files: string[]): Promise<{ [x: string]: PSDKEntity }> => {
  const promises = files.map((f) => {
    return fs.promises
      .readFile(path.join(dir, f), 'utf8')
      .then((content) => {
        return { [path.parse(f).name]: JSON.parse(content) };
      })
      .catch((e) => {
        log.error(e);
        return {};
      });
  });
  return Promise.all(promises).then((r) => {
    return { [path.basename(dir)]: Object.assign({}, ...r) };
  });
};

export default class ProjectLoadingChannelService extends AbstractIpcChannel {
  channelName = 'project-loading';

  async handle(event: IpcMainEvent, request: ProjectLoadingParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    const projectDataPath = path.join(request.path, 'Data/Studio');

    Promise.all(
      fs
        .readdirSync(projectDataPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const dir = path.join(projectDataPath || '', dirent.name);
          return readFiles(
            dir,
            fs.readdirSync(dir).filter((f) => {
              return f.endsWith('.json');
            })
          );
        })
    )
      .then((r) => {
        return event.sender.send(responseChannel, {
          projectData: Object.assign({}, ...r),
        });
      })
      .catch((r) => {
        log.error(r);
        return event.sender.send(responseChannel, {
          error: `Failed to load project data ${r}`,
        });
      });
  }
}
