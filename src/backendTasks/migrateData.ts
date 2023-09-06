import { addMoveCharacteristics } from '@src/migrations/addMoveCharacteristics';
import { addStepsAverageToGroup } from '@src/migrations/addStepsAverageToGroup';
import { baseForMaps } from '@src/migrations/baseForMaps';
import { fixBeMethodMoveSelfStatus } from '@src/migrations/fixBeMethodMoveSelfStatus';
import { fixCsvFileIdDex } from '@src/migrations/fixCsvFileIdDex';
import { linkResourcesToCreatures } from '@src/migrations/linkResourcesToCreatures';
import { migrateHeadbutt } from '@src/migrations/migrateHeadbutt';
import { migrateMapLinks } from '@src/migrations/migrateMapLinks';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';

export type MigrationTask = (event: IpcMainEvent, projectPath: string) => Promise<void>;

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATIONS: Record<string, MigrationTask[]> = {
  '1.0.0': [
    migrateMapLinks,
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.0.1': [
    migrateMapLinks,
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.0.2': [
    migrateMapLinks,
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.1.0': [
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.1.1': [
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.2.0': [
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.3.0': [
    linkResourcesToCreatures,
    migrateHeadbutt,
    fixBeMethodMoveSelfStatus,
    fixCsvFileIdDex,
    baseForMaps,
    addMoveCharacteristics,
    addStepsAverageToGroup,
  ],
  '1.4.0': [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup],
  '1.4.1': [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup],
  '1.4.2': [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup],
  '1.4.3': [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup],
  '1.4.4': [fixCsvFileIdDex, baseForMaps, addMoveCharacteristics, addStepsAverageToGroup], // Don't forget to add the official version coming up
};

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATION_STEP_TEXTS: Record<string, string[]> = {
  '1.0.0': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.0.1': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.0.2': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.1.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.1.1': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.2.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.3.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.4.0': [
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.4.1': [
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.4.2': [
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.4.3': [
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ],
  '1.4.4': [
    'Fix the csv file id of the dex',
    'Add files and folder for the maps',
    'Add new characteristics in the moves',
    'Add steps average at the groups',
  ], // Don't forget to add the official version coming up
};

export type MigrateDataInput = { projectPath: string; projectVersion: string };

const migrateData = async (payload: MigrateDataInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('migrate-data', payload.projectVersion);

  const dataToMigrate = MIGRATIONS[payload.projectVersion];
  const stepTexts = MIGRATION_STEP_TEXTS[payload.projectVersion];
  if (dataToMigrate && stepTexts) {
    log.info('migrate-data', `Found ${dataToMigrate.length} migrations`);
    await dataToMigrate.reduce(async (prev, curr, index) => {
      await prev;
      sendProgress(event, channels, { step: index + 1, total: dataToMigrate.length, stepText: stepTexts[index] });
      await curr(event, payload.projectPath);
    }, Promise.resolve());
  } else {
    log.info('migrate-data', 'No data to migrate found!');
  }
  log.info('migrate-data/success');
  return {};
};

export const registerMigrateData = defineBackendServiceFunction('migrate-data', migrateData);
