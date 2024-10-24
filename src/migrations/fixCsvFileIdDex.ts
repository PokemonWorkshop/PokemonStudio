import { parseJSON } from '@utils/json/parse';
import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { deletePSDKDatFile } from './migrateUtils';
import { DEX_VALIDATOR, StudioDex } from '@modelEntities/dex';

export const fixCsvFileIdDex = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const dexes = await readProjectFolder(projectPath, 'dex');
  await dexes.reduce(async (lastPromise, dex) => {
    await lastPromise;
    const dexParsed = DEX_VALIDATOR.safeParse(parseJSON<StudioDex>(dex.data, dex.filename));
    if (dexParsed.success) {
      const csvFileId = dexParsed.data.csv.csvFileId;
      if (csvFileId < 100_000) dexParsed.data.csv.csvFileId = csvFileId + 100_000;
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/dex', `${dexParsed.data.dbSymbol}.json`),
        JSON.stringify(dexParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
