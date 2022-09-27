import AbstractIpcChannel from '@services/IPC/abstract.ipc.channel';
import { IpcRequest } from '@services/IPC/ipc.request';
import { IpcMainEvent } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface MoveImageParameters extends IpcRequest {
  path: string;
  savingImage: { [path: string]: string };
}

function pathsAreEqual(path1: string, path2: string) {
  const path1r = path.resolve(path1);
  const path2r = path.resolve(path2);
  if (process.platform == 'win32') return path1r.toLowerCase() === path2r.toLowerCase();
  return path1r === path2r;
}

export default class MoveImageChannelService extends AbstractIpcChannel {
  channelName = 'move-image';

  async handle(event: IpcMainEvent, request: MoveImageParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    return Promise.all(
      Object.entries(request.savingImage).map(async ([dest, src]) => {
        const fullDest = path.join(request.path, dest);
        const parsedDest = path.parse(fullDest);
        if (pathsAreEqual(fullDest, src)) return;
        if (fs.existsSync(fullDest)) fs.renameSync(fullDest, path.join(request.path, parsedDest.name + '_old' + parsedDest.ext));
        fs.copyFileSync(src, fullDest);
        return;
      })
    )
      .then(() => {
        return event.sender.send(responseChannel, {});
      })
      .catch((r) => {
        event.sender.send(responseChannel, { error: r });
      });
  }
}
