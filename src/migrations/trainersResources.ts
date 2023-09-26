import { IpcMainEvent } from 'electron';
import { deletePSDKDatFile } from './migrateUtils';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import { StudioTrainer, StudioTrainerResources, TRAINER_VALIDATOR } from '@modelEntities/trainer';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';

const PRE_MIGRATION_TRAINER_VALIDATOR = TRAINER_VALIDATOR.omit({ resources: true }).extend({ battlers: z.array(z.string()).nonempty() });
type StudioTrainerDataBeforeMigration = z.infer<typeof PRE_MIGRATION_TRAINER_VALIDATOR>;

const migrateResource = (trainer: StudioTrainerDataBeforeMigration, projectPath: string): StudioTrainer => {
  // Avoid compiling resources if it was already there
  if ('resources' in trainer) return trainer as StudioTrainerDataBeforeMigration & { resources: StudioTrainerResources };

  const battler = trainer.battlers[0] || '';
  const battlerPath = path.join(projectPath, 'graphics/battlers');

  const sprite = fs.existsSync(path.join(battlerPath, `${battler}.png`)) ? battler : '';
  const artworkFull = fs.existsSync(path.join(battlerPath, `${battler}_big.png`)) ? `${battler}_big` : '';
  const artworkSmall = fs.existsSync(path.join(battlerPath, `${battler}_sma.png`)) ? `${battler}_sma` : '';

  const resources: StudioTrainerResources = {
    sprite,
    artworkFull,
    artworkSmall,
    character: '',
    musics: {
      bgm: '',
      defeat: '',
      encounter: '',
      victory: '',
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { battlers: _, ...trainerWithoutBattlers } = trainer;
  return { ...trainerWithoutBattlers, resources };
};

export const trainersResources = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const trainers = await readProjectFolder(projectPath, 'trainers');
  await trainers.reduce(async (lastPromise, trainer) => {
    await lastPromise;
    const trainerParsed = PRE_MIGRATION_TRAINER_VALIDATOR.safeParse(JSON.parse(trainer));
    if (trainerParsed.success) {
      const trainerMigrated = migrateResource(trainerParsed.data, projectPath);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/trainers', `${trainerMigrated.dbSymbol}.json`),
        JSON.stringify(trainerMigrated, null, 2)
      );
    }
  }, Promise.resolve());
};
