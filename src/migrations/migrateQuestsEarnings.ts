import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { deletePSDKDatFile } from './migrateUtils';
import { QUEST_VALIDATOR, StudioQuest } from '@modelEntities/quest';
import { parseJSON } from '@utils/json/parse';
import { createEncounter } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { removeExpandPokemonSetup } from '@utils/cleanNaNValue';

const migrateEarnings = (quest: StudioQuest) => {
  quest.earnings.forEach((earning) => {
    if (!['earning_pokemon', 'earning_egg'].includes(earning.earningMethodName)) return;

    const encounter = createEncounter(false);
    encounter.specie = earning.earningArgs[0] as DbSymbol;
    removeExpandPokemonSetup(encounter, 'originalTrainerId');
    removeExpandPokemonSetup(encounter, 'originalTrainerName');
    earning.earningArgs[0] = encounter;
  });
};

export const migrateQuestsEarnings = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const quests = await readProjectFolder(projectPath, 'quests');
  await quests.reduce(async (lastPromise, quest) => {
    await lastPromise;
    const questParsed = QUEST_VALIDATOR.safeParse(parseJSON(quest.data, quest.filename));
    if (questParsed.success) {
      migrateEarnings(questParsed.data);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/quests', `${questParsed.data.dbSymbol}.json`),
        JSON.stringify(questParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
