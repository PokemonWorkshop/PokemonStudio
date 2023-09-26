import { IpcMainEvent } from 'electron';
import { addMoveCharacteristics } from './addMoveCharacteristics';
import { addStepsAverageToGroup } from './addStepsAverageToGroup';
import { baseForMaps } from './baseForMaps';
import { fixCsvFileIdDex } from './fixCsvFileIdDex';
import { trainersResources } from './trainersResources';

const MIGRATION_V2 = [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup, trainersResources];

export const migrationV2 = async (event: IpcMainEvent, projectPath: string) => {
  await MIGRATION_V2.reduce(async (prev, curr) => {
    await prev;
    await curr(event, projectPath);
  }, Promise.resolve());
};
