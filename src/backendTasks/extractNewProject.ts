import type { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { mkdirSync } from 'fs';
import { getAppRootPath } from './getAppRootPath';
import path from 'path';
import extract from 'extract-zip';
import { ZipFile } from 'yauzl';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';

const PSDK_PROJECT_PATH = 'new-project.zip';

export type ExtractNewProjectInput = { projectDirName: string };

const extractNewProject = async (payload: ExtractNewProjectInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('extract-new-project', payload);
  const countEntry = { value: 1 };

  log.info('extract-new-project/creating directory');
  mkdirSync(payload.projectDirName);
  log.info('extract-new-project/extract');
  await extract(path.join(getAppRootPath(), PSDK_PROJECT_PATH), {
    dir: payload.projectDirName,
    onEntry: (_, zipFile: ZipFile) => {
      const progress = Number(((countEntry.value / zipFile.entryCount) * 100).toFixed(1));
      sendProgress(event, channels, { step: progress, total: 100, stepText: '' });
      event.sender.send('extract-new-project/progress', { step: progress, total: 100, stepText: '' });
      countEntry.value++;
    },
  });
  return {};
};

export const registerExtractNewProject = defineBackendServiceFunction('extract-new-project', extractNewProject);
