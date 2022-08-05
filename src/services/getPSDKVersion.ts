import path from 'path';
import fs from 'fs';
import { versionIntToString } from '@utils/versionIntToString';
import { getAppRootPath } from '@src/backendTasks/getAppRootPath';

export const PSDK_DOWNLOADS_URL = 'https://download.psdk.pokemonworkshop.com/downloads';

export type PSDKVersion = {
  int: number;
  string: string;
};

export const getPSDKBinariesPath = (): string => {
  return path.join(getAppRootPath(), 'psdk-binaries');
};

export const getPSDKVersion = (): PSDKVersion => {
  const fileData = fs.readFileSync(path.join(getPSDKBinariesPath(), 'pokemonsdk/version.txt')).toString('utf-8');
  const int = Number(fileData);

  return {
    int,
    string: versionIntToString(int),
  };
};
