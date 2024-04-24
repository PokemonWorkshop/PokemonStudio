import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { GROUP_TOOL_VALIDATOR, GROUP_VALIDATOR } from '@modelEntities/group';
import { parseJSON } from '@utils/json/parse';

const PRE_MIGRATION_GROUP_VALIDATOR = GROUP_VALIDATOR.extend({
  tool: GROUP_TOOL_VALIDATOR.or(z.literal('HeadButt')),
});
type StudioGroupDataBeforeMigration = z.infer<typeof PRE_MIGRATION_GROUP_VALIDATOR>;

const moveHeadButt = (group: StudioGroupDataBeforeMigration) => {
  if (group.tool === 'HeadButt') {
    group.tool = null;
    group.systemTag = 'HeadButt';
  }
};

export const migrateHeadbutt = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const groups = await readProjectFolder(projectPath, 'groups');
  await groups.reduce(async (lastPromise, group) => {
    await lastPromise;
    const groupParsed = PRE_MIGRATION_GROUP_VALIDATOR.safeParse(parseJSON(group.data, group.filename));
    if (groupParsed.success) {
      moveHeadButt(groupParsed.data);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/groups', `${groupParsed.data.dbSymbol}.json`),
        JSON.stringify(groupParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
