import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type FileExistsInput = { filePath: string };
export type FileExistsOutput = { result: boolean };

const fileExists = async (payload: FileExistsInput): Promise<FileExistsOutput> => {
  log.info('file-exists');

  const result = fs.existsSync(payload.filePath);
  log.info('file-exists/success', { result });
  return { result };
};

export const registerFileExists = defineBackendServiceFunction('file-exists', fileExists);
