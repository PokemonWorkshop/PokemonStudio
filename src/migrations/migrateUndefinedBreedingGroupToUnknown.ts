import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { StudioCreature, CREATURE_VALIDATOR } from '@modelEntities/creature';
import { deletePSDKDatFile } from './migrateUtils';
import { parseJSON } from '@utils/json/parse';

const changeUndefinedBreedingGroupToUnknown = (creature: StudioCreature) => {
  creature.forms.forEach((form) => {
    if (form.breedGroups[0] === 0) form.breedGroups[0] = 15;
    if (form.breedGroups[1] === 0) form.breedGroups[1] = 15;
  });
};

export const migrateUndefinedBreedingGroupToUnknown = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const creatureData = await readProjectFolder(projectPath, 'pokemon');
  await creatureData.reduce(async (lastPromise, creature) => {
    await lastPromise;
    const creatureParsed = CREATURE_VALIDATOR.safeParse(parseJSON(creature.data, creature.filename));
    if (creatureParsed.success) {
      changeUndefinedBreedingGroupToUnknown(creatureParsed.data);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/pokemon', `${creatureParsed.data.dbSymbol}.json`),
        JSON.stringify(creatureParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
