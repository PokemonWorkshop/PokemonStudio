import { IpcMainEvent } from 'electron';
import { addOtherLanguages } from './addOtherLanguages';
import { fixCreatureValuesAfterZodChange } from './fixCreatureValuesAfterZodChange';

const MIGRATION_PRE_V2_3 = [addOtherLanguages, fixCreatureValuesAfterZodChange];

export const migrationPreV2_3 = async (event: IpcMainEvent, projectPath: string) => {
  await MIGRATION_PRE_V2_3.reduce(async (prev, curr) => {
    await prev;
    await curr(event, projectPath);
  }, Promise.resolve());
};
