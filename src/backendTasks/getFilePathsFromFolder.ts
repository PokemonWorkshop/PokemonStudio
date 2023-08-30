import fs from 'fs';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import path from 'path';

export type GetFilePathsFromFolderInput = { folderPath: string; extensions?: string[]; isRecursive?: boolean };
export type GetFilePathsFromFolderOutput = { filePaths: string[] };

const readFolder = async (folderPath: string, isRecursive?: boolean): Promise<string[]> => {
  const promise: Promise<string[]> = new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files);
    });
  });
  const files = await promise;
  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) return filePath;
      if (isRecursive) return await readFolder(filePath, isRecursive);

      return '__FOLDER__';
    })
  ).then((result) => {
    const arr: string[] = [];
    return arr.concat(...result);
  });
};

const getFilePathsFromFolder = async (payload: GetFilePathsFromFolderInput): Promise<GetFilePathsFromFolderOutput> => {
  log.info('get-file-paths-from-folder');

  const files = await readFolder(payload.folderPath, payload.isRecursive);
  const filesWithoutFolder = files.filter((files) => files !== '__FOLDER__');
  if (payload.extensions !== undefined) {
    const filesFiltered = filesWithoutFolder.filter((file) => payload.extensions?.includes(path.extname(file)));
    log.info('get-file-paths-from-folder/success');
    return { filePaths: filesFiltered };
  }

  log.info('get-file-paths-from-folder/success');
  return { filePaths: filesWithoutFolder };
};

export const registerGetFilePathsFromFolder = defineBackendServiceFunction('get-file-paths-from-folder', getFilePathsFromFolder);
