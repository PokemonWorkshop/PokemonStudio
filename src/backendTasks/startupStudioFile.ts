import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import log from 'electron-log';

export type StartupStudioFileOutput = { projectPath: string | undefined };
export const startupFiles: string[] = [];

const startupStudioFile = async (): Promise<StartupStudioFileOutput> => {
  log.info('startup-studio-file', { startupFiles });
  const file = startupFiles.pop();

  return { projectPath: file?.replace(/[/\\][^/\\]+.studio$/, '') };
};

export const registerStartupStudioFile = defineBackendServiceFunction('startup-studio-file', startupStudioFile);
