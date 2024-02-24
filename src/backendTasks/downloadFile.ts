import { IpcMainEvent, net } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { calculateFileSha1, compareSha1 } from './calculateFileSha1';
import { Sha1 } from '@modelEntities/sha1';
import { getStudioResourcesPath } from './getStudioResourcesPath';

type DestFile = { target: 'studio'; path?: string; filename: string } | { target: 'project'; path: string; filename: string };
export type DownloadFileInput = { url: string; dest: DestFile; sha1?: string };

const finished = promisify(stream.finished);

const getDestPath = (destFile: DestFile) => {
  if (destFile.target === 'studio') {
    if (destFile.path) return path.join(getStudioResourcesPath(), destFile.path, destFile.filename);
    return path.join(getStudioResourcesPath(), destFile.filename);
  } else {
    return path.join(destFile.path, destFile.filename);
  }
};

const getSpeed = (speed: { lastTime: number; speed: number; lastBytesWritten: number }, currentBytesWritten: number) => {
  const currentTime = Date.now();
  if (currentTime >= speed.lastTime + 1000) {
    return { lastTime: currentTime, speed: currentBytesWritten - speed.lastBytesWritten, lastBytesWritten: currentBytesWritten };
  }
  return speed;
};

const downloadFile = async (payload: DownloadFileInput, event: IpcMainEvent, channels: ChannelNames) => {
  const destPath = getDestPath(payload.dest);
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
  const writer = fs.createWriteStream(getDestPath(payload.dest));
  const request = net.request(payload.url);

  request.on('response', (response) => {
    const length = Number(response.headers['content-length']);
    let speed = { lastTime: 0, speed: 0, lastBytesWritten: 0 };

    response.on('data', (chunk) => {
      writer.write(chunk);
      const progress = writer.bytesWritten / length;
      speed = getSpeed(speed, writer.bytesWritten);
      sendProgress(event, channels, { step: (progress ?? 0) * 100, total: 0, stepText: speed.speed.toString() });
    });
    response.on('end', () => {
      sendProgress(event, channels, { step: 100, total: 0, stepText: speed.speed.toString() });
      writer.close();
    });
  });
  request.on('error', (error) => {
    throw error;
  });
  request.end();

  await finished(writer);

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
