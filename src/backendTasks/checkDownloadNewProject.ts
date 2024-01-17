import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { requestFile } from './requestFile';
import { getAppRootPath } from './getAppRootPath';
import { Sha1 } from '@modelEntities/sha1';
import { calculateFileSha1, compareSha1 } from './calculateFileSha1';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type CheckDownloadNewProjectInput = { url: string };
export type CheckDownloadNewProjectOutput = { needDownload: false } | { needDownload: true; filename: string; sha1: Sha1 };
export type LatestNewProject = { filename: string; sha1: string };

export const checkDownloadNewProject = async (payload: CheckDownloadNewProjectInput) => {
  log.info('check-download-new-project', payload);
  const archivePath = path.join(getAppRootPath(), 'new-project.zip');
  const file = (await requestFile(payload.url)) as LatestNewProject;
  log.info('check-download-new-project/request-file', file);

  if (fs.existsSync(archivePath)) {
    const currentSha1 = await calculateFileSha1(archivePath);
    if (compareSha1(currentSha1, file.sha1 as Sha1)) {
      log.info('check-download-new-project/success', { needDownload: false });
      return { needDownload: false } as CheckDownloadNewProjectOutput;
    }
  }
  log.info('check-download-new-project/success', { needDownload: true });
  return { needDownload: true, ...file } as CheckDownloadNewProjectOutput;
};

export const registerCheckDownloadNewProject = defineBackendServiceFunction('check-download-new-project', checkDownloadNewProject);
