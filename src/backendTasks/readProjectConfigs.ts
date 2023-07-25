import type { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { PSDKConfigs, psdkConfigKeys } from '@src/GlobalStateProvider';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';

export type ProjectConfigsFromBackEnd = Record<keyof PSDKConfigs, string>;
export type ReadProjectConfigsInput = { path: string };

const readProjectConfigs = async (payload: ReadProjectConfigsInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('read-project-configs');

  const projectConfigs = psdkConfigKeys.reduce((prev, curr, index) => {
    sendProgress(event, channels, { step: index + 1, total: psdkConfigKeys.length, stepText: curr });
    const fileData = fs.readFileSync(path.join(payload.path, 'Data/configs', `${curr}.json`), { encoding: 'utf-8' });
    return { ...prev, [curr]: fileData };
  }, {} as ProjectConfigsFromBackEnd);
  log.info('read-project-configs/success');
  return projectConfigs;
};

export const registerReadProjectConfigs = defineBackendServiceFunction('read-project-configs', readProjectConfigs);
