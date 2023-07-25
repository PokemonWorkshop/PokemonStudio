import { app } from 'electron';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type GetStudioVersionOutput = { studioVersion: string };

const getStudioVersion = async (): Promise<GetStudioVersionOutput> => {
  log.info('get-studio-version');
  log.info('get-studio-version/success', { studioVersion: app.getVersion() });
  return { studioVersion: app.getVersion() };
};

export const registerGetStudioVersion = defineBackendServiceFunction('get-studio-version', getStudioVersion);
