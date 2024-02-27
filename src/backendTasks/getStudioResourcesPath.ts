import { getAppRootPath } from './getAppRootPath';
import path from 'path';
import fs from 'fs';

export const getStudioResourcesPath = () => {
  if (process.env.NODE_ENV === 'development') return getAppRootPath();
  if (process.env.APPDATA) return createFolder(path.join(process.env.APPDATA, '.pokemon-studio-resources'));
  if (process.env.HOME) return createFolder(path.join(process.env.HOME, '.pokemon-studio-resources'));

  return getAppRootPath();
};

const createFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  return path;
};
