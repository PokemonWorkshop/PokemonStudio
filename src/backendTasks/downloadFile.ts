import axios from 'axios';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { getAppRootPath } from './getAppRootPath';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { calculateFileSha1, compareSha1 } from './calculateFileSha1';
import { Sha1 } from '@modelEntities/sha1';

type DestFile = { target: 'studio'; path?: string; filename: string } | { target: 'project'; path: string; filename: string };
export type DownloadFileInput = { url: string; dest: DestFile; sha1?: string };

const finished = promisify(stream.finished);

const getDestPath = (destFile: DestFile) => {
  if (destFile.target === 'studio') {
    if (destFile.path) return path.join(getAppRootPath(), destFile.path, destFile.filename);
    return path.join(getAppRootPath(), destFile.filename);
  } else {
    return path.join(destFile.path, destFile.filename);
  }
};

const downloadFile = async (payload: DownloadFileInput, event: IpcMainEvent, channels: ChannelNames) => {
  const destPath = getDestPath(payload.dest);
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
  const writer = fs.createWriteStream(getDestPath(payload.dest));
  await axios({
    method: 'get',
    url: payload.url,
    responseType: 'stream',
    onDownloadProgress: ({ rate, progress }) => {
      sendProgress(event, channels, { step: (progress ?? 0) * 100, total: 0, stepText: (rate || 0).toString() });
    },
  }).then(async (response) => {
    response.data.pipe(writer);
    return await finished(writer);
  });
  if (!payload.sha1) return;

  const currentSha1 = await calculateFileSha1(destPath);
  if (!compareSha1(currentSha1, payload.sha1 as Sha1)) {
    throw new Error(`Bad signature for the file downloaded: ${destPath}`);
  }
};

const downloadFileService = async (payload: DownloadFileInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('download-file', payload);
  await downloadFile(payload, event, channels);
  log.info('download-file/success');
  return {};
};

export const registerDownloadFile = defineBackendServiceFunction('download-file', downloadFileService);
