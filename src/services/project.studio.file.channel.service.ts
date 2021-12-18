import * as fs from 'fs';
import path from 'path';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';

export type ProjectStudioAction = 'READ' | 'UPDATE' | 'DELETE';

interface ProjectStudioFileParameters extends IpcRequest {
  path: string | null;
  action: ProjectStudioAction;
  data?: string;
}

const readFile = async (projectStudioPath: string) => {
  return fs.promises
    .readFile(projectStudioPath, 'utf8')
    .then((content) => {
      return content;
    })
    .catch((e) => {
      log.error(e);
      return undefined;
    });
};

const writeFile = async (projectStudioPath: string, content: string) => {
  return fs.promises.writeFile(projectStudioPath, content, { flag: 'w+' }).catch((e) => log.error(e));
};

const deleteFile = async (projectStudioPath: string) => {
  return fs.promises.unlink(projectStudioPath).catch((e) => log.error(e));
};

export default class ProjectStudioFileChannelService extends AbstractIpcChannel {
  channelName = 'project-studio-file';

  async handle(event: IpcMainEvent, request: ProjectStudioFileParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    if (!request.path) return event.sender.send(responseChannel, { error: 'The path is null' });
    const projectStudioPath = path.join(request.path, 'project.studio');

    if (request.action === 'READ') {
      return readFile(projectStudioPath)
        .then((projectStudio) => {
          return event.sender.send(responseChannel, { projectStudio });
        })
        .catch(() => event.sender.send(responseChannel, { error: 'Failed to find project.studio' }));
    } else if (request.action === 'DELETE' && fs.existsSync(projectStudioPath)) {
      return deleteFile(projectStudioPath)
        .then(() => {
          return event.sender.send(responseChannel, {});
        })
        .catch(() => event.sender.send(responseChannel, { error: 'Failed to delete project.studio' }));
    } else {
      if (!request.data) return event.sender.send(responseChannel, { error: 'projectStudio data is undefined' });
      return writeFile(projectStudioPath, request.data)
        .then(() => {
          return event.sender.send(responseChannel, {});
        })
        .catch(() => event.sender.send(responseChannel, { error: 'Failed to update or create project.studio' }));
    }
  }
}
