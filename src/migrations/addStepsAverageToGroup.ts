import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { GROUP_VALIDATOR, StudioGroup } from '@modelEntities/group';

const PRE_MIGRATION_GROUP_VALIDATOR = GROUP_VALIDATOR.omit({ stepsAverage: true });
type StudioGroupDataBeforeMigration = z.infer<typeof PRE_MIGRATION_GROUP_VALIDATOR>;

const addStepsAverage = (group: StudioGroupDataBeforeMigration): StudioGroup => {
  return {
    ...group,
    stepsAverage: 30,
  };
};

export const addStepsAverageToGroup = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const groups = await readProjectFolder(projectPath, 'groups');
  await groups.reduce(async (lastPromise, group) => {
    await lastPromise;
    const groupParsed = PRE_MIGRATION_GROUP_VALIDATOR.safeParse(JSON.parse(group));
    if (groupParsed.success) {
      const newGroup = addStepsAverage(groupParsed.data);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/groups', `${newGroup.dbSymbol}.json`), JSON.stringify(newGroup, null, 2));
    }
  }, Promise.resolve());
};
