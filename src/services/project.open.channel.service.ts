import path from 'path';
import { dialog, IpcMainEvent } from 'electron';
import log from 'electron-log';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';

export type ProjectType = 'studio' | 'rxproj';

interface ProjectOpenParameters extends IpcRequest {
  projectType: ProjectType;
}

const getProjectPath = (projectType: ProjectType) =>
  dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: projectType === 'studio' ? 'Pokémon Studio Project' : 'RPGXP Project',
          extensions: [projectType],
        },
      ],
    })
    .then((result) => (result.filePaths[0] ? path.dirname(result.filePaths[0]) : ''))
    .catch((err) => {
      log.error(err);
      return '';
    });

export default class ProjectOpenChannelService extends AbstractIpcChannel {
  channelName = 'project-open';

  async handle(event: IpcMainEvent, request: ProjectOpenParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    return getProjectPath(request.projectType)
      .then((projectPath) => {
        return event.sender.send(responseChannel, projectPath ? { projectPath } : { error: 'No project path returned' });
      })
      .catch(() => event.sender.send(responseChannel, { error: 'Failed to find project path' }));
  }
}
