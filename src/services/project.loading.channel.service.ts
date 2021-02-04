import * as fs from 'fs';
import path, { join } from 'path';
import { dialog } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import PSDKEntity from '../models/entities/PSDKEntity';

interface ProjectLoadingParameters extends IpcRequest {
  path: string;
}

async function readFiles(
  dir: string,
  files: string[]
): Promise<{ [x: string]: PSDKEntity }> {
  const promises = files.map((f) => {
    return fs.promises
      .readFile(join(dir, f), 'utf8')
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
}

async function getProjectPath(): Promise<string> {
  const projectPath = await dialog
    .showOpenDialog({ properties: ['openDirectory'] })
    .then((result) => result.filePaths[0])
    .catch((err) => log.error(err));
  return projectPath || '';
}

export default class ProjectLoadingChannelService extends AbstractIpcChannel {
  channelName = 'project-loading';

  async handle(
    event: Electron.IpcMainEvent,
    request: ProjectLoadingParameters
  ): Promise<void> {
    if (!request.responseChannel) {
      request.responseChannel = `${this.name}_response`;
    }

    const projectPath = await getProjectPath();

    Promise.all(
      fs
        .readdirSync(projectPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const dir = join(projectPath || '', dirent.name);
          return readFiles(
            dir,
            fs.readdirSync(dir).filter((f) => {
              return f.endsWith('.json');
            })
          );
        })
    )
      .then((r) => {
        return event.sender.send(request.responseChannel!, {
          projectData: Object.assign({}, ...r),
          path: projectPath,
        });
      })
      .catch((r) => {
        log.error(r);
      });
  }
}
