import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { GROUP_VALIDATOR, StudioGroup, StudioGroupVsType } from '@modelEntities/group';
import { parseJSON } from '@utils/json/parse';

const PRE_MIGRATION_GROUP_VALIDATOR = GROUP_VALIDATOR.omit({ vsType: true }).extend({
  isDoubleBattle: z.boolean().default(false),
  isHordeBattle: z.boolean().default(false),
});
type StudioGroupDataBeforeMigration = z.infer<typeof PRE_MIGRATION_GROUP_VALIDATOR>;

const determineVsType = (group: StudioGroupDataBeforeMigration): StudioGroupVsType => {
  if (group.isDoubleBattle) return 'double';
  if (group.isHordeBattle) return 'horde';

  return 'simple';
};

const addVsType = (group: StudioGroupDataBeforeMigration): StudioGroup => {
  const vsType = determineVsType(group);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDoubleBattle, isHordeBattle, ...newGroup } = group;
  return {
    ...newGroup,
    vsType,
  };
};

export const migrateGroupsFor3v3BattleMode = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const groups = await readProjectFolder(projectPath, 'groups');
  await groups.reduce(async (lastPromise, group) => {
    await lastPromise;
    const groupParsed = PRE_MIGRATION_GROUP_VALIDATOR.safeParse(parseJSON<StudioGroup>(group.data, group.filename));
    if (groupParsed.success) {
      const newGroup = addVsType(groupParsed.data);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/groups', `${newGroup.dbSymbol}.json`), JSON.stringify(newGroup, null, 2));
    }
  }, Promise.resolve());
};
