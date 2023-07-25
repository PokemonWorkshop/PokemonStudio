import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import type { ProjectStudioAction } from '@utils/SavingUtils';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ProjectStudioFileInput = { path: string; action: ProjectStudioAction; data?: string };
export type ProjectStudioFileOutput = { fileData?: string };

// TODO: Split this in to as much logical function as needed (pretty sure delete is not needed).
const projectStudioFile = async (payload: { path: string; action: ProjectStudioAction; data?: string }): Promise<ProjectStudioFileOutput> => {
  log.info('project-studio-file', { path: payload.path, action: payload.action });
  const projectStudioPath = path.join(payload.path, 'project.studio');
  switch (payload.action) {
    case 'READ': {
      const fileData = fs.readFileSync(projectStudioPath, { encoding: 'utf-8' });
      log.info('project-studio-file/success');
      return { fileData };
    }
    case 'UPDATE':
      if (!payload.data) throw 'data are missing';
      fs.writeFileSync(projectStudioPath, payload.data);
      return {};
    case 'DELETE':
      if (fs.existsSync(projectStudioPath)) fs.unlinkSync(projectStudioPath);
      return {};
  }
};

export const registerProjectStudioFile = defineBackendServiceFunction('project-studio-file', projectStudioFile);
