import { IpcMainEvent } from 'electron';
import { linkResourcesToCreatures } from './linkResourcesToCreatures';
import { migrateHeadbutt } from './migrateHeadbutt';
import { fixBeMethodMoveSelfStatus } from './fixBeMethodMoveSelfStatus';

const MIGRATION_PRE_V2 = [linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus];

export const migrationPreV2 = async (event: IpcMainEvent, projectPath: string) => {
  await MIGRATION_PRE_V2.reduce(async (prev, curr) => {
    await prev;
    await curr(event, projectPath);
  }, Promise.resolve());
};
