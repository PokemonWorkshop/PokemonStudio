import { IpcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { ProjectStudioAction } from '@utils/SavingUtils';

const projectStudioFile = async (event: IpcMainEvent, payload: { path: string; action: ProjectStudioAction; data?: string }) => {
  log.info('project-studio-file', { path: payload.path, action: payload.action });
  const projectStudioPath = path.join(payload.path, 'project.studio');
  try {
    switch (payload.action) {
      case 'READ': {
        const fileData = fs.readFileSync(projectStudioPath, { encoding: 'utf-8' });
        log.info('project-studio-file/success');
        return event.sender.send('project-studio-file/success', { fileData });
      }
      case 'UPDATE':
        if (payload.data) {
          fs.writeFileSync(projectStudioPath, payload.data);
          return event.sender.send('project-studio-file/success', {});
        } else {
          log.error('project-studio-file/failure', 'data are missing');
          return event.sender.send('project-studio-file/failure', { errorMessage: 'data are missing' });
        }
      case 'DELETE':
        if (fs.existsSync(projectStudioPath)) fs.unlinkSync(projectStudioPath);
        return event.sender.send('project-studio-file/success', {});
    }
  } catch (error) {
    log.error('project-studio-file/failure', error);
    event.sender.send('project-studio-file/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerProjectStudioFile = (ipcMain: IpcMain) => {
  ipcMain.on('project-studio-file', projectStudioFile);
};
