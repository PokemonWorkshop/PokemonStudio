import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { versionIntToString } from '@utils/versionIntToString';

export const PSDK_DOWNLOADS_URL = 'https://download.psdk.pokemonworkshop.com/downloads';

export type PSDKVersion = {
  int: number;
  string: string;
};

export const getPSDKBinariesPath = (): string => {
  if (!app.isPackaged) return path.join(__dirname, '../../psdk-binaries');
  return path.join(path.dirname(app.getPath('exe')), 'psdk-binaries');
};

export const getPSDKVersion = (): PSDKVersion => {
  const fileData = fs.readFileSync(path.join(getPSDKBinariesPath(), 'pokemonsdk/version.txt')).toString('utf-8');
  const int = Number(fileData);

  return {
    int,
    string: versionIntToString(int),
  };
};
