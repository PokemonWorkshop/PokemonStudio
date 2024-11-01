import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import fsPromises from 'fs/promises';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';
import type { StudioSettings } from '@utils/settings';
import { parseJSON } from '@utils/json/parse';
import { migrateMapLinks } from '@src/migrations/migrateMapLinks';
import { migrationV2 } from '@src/migrations/migrationV2';
import { migrationPreV2 } from '@src/migrations/migrationPreV2';
import { migrationPreV2_1 } from '@src/migrations/migrationPreV2_1';
import { fixCreatureValuesAfterZodChange } from '@src/migrations/fixCreatureValuesAfterZodChange';
import { addFormNamesDescriptions } from '@src/migrations/addFormNamesDescriptions';
import { migrationPreV2_3 } from '@src/migrations/migrationPreV2_3';
import { migrateNaturesToEntities } from '@src/migrations/migrateNaturesToEntities';

export type MigrationTask = (event: IpcMainEvent, projectPath: string, studioSettings?: StudioSettings) => Promise<void>;

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATIONS: Record<string, MigrationTask[]> = {
  '1.0.0': [migrateMapLinks, migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.0.1': [migrateMapLinks, migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.0.2': [migrateMapLinks, migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.1.0': [migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.1.1': [migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.2.0': [migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.3.0': [migrationPreV2, migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.4.0': [migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.4.1': [migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.4.2': [migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.4.3': [migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '1.4.4': [migrationV2, migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.0.0': [migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.0.1': [migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.0.2': [migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.0.3': [migrationPreV2_1, migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.1.0': [migrationPreV2_3, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.2.0': [fixCreatureValuesAfterZodChange, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.2.1': [fixCreatureValuesAfterZodChange, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.2.2': [fixCreatureValuesAfterZodChange, addFormNamesDescriptions, migrateNaturesToEntities],
  '2.2.3': [addFormNamesDescriptions, migrateNaturesToEntities],
  '2.2.4': [addFormNamesDescriptions, migrateNaturesToEntities],
  '2.3.0': [migrateNaturesToEntities], // Don't forget to add the official version coming up
};

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATION_STEP_TEXTS: Record<string, string[]> = {
  '1.0.0': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.0.1': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.0.2': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.1.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.1.1': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.2.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.3.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.4.0': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.4.1': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.4.2': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.4.3': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '1.4.4': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.0.0': [
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.0.1': [
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.0.2': [
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.0.3': [
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.1.0': [
    'Add basic languages',
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.2.0': [
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.2.1': [
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.2.2': [
    'Update creatures values after change in the values authorized',
    'Update creatures and create CSV files to manage form names and descriptions',
    'Migrate natures config to nature entities',
  ],
  '2.2.3': ['Update creatures and create CSV files to manage form names and descriptions', 'Migrate natures config to nature entities'],
  '2.2.4': ['Update creatures and create CSV files to manage form names and descriptions', 'Migrate natures config to nature entities'],
  '2.3.0': ['Migrate natures config to nature entities'], // Don't forget to add the official version coming up
};

export type MigrateDataInput = { projectPath: string; projectVersion: string; studioSettings: StudioSettings };
export type MigrateDataOutput = { projectStudio: StudioProject };

const migrateData = async (payload: MigrateDataInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('migrate-data', payload.projectVersion);

  const dataToMigrate = MIGRATIONS[payload.projectVersion];
  const stepTexts = MIGRATION_STEP_TEXTS[payload.projectVersion];
  if (dataToMigrate && stepTexts) {
    log.info('migrate-data', `Found ${dataToMigrate.length} migrations`);
    await dataToMigrate.reduce(async (prev, curr, index) => {
      await prev;
      sendProgress(event, channels, { step: index + 1, total: dataToMigrate.length, stepText: stepTexts[index] });
      await curr(event, payload.projectPath, payload.studioSettings);
    }, Promise.resolve());
  } else {
    log.info('migrate-data', 'No data to migrate found!');
  }
  const projectStudioFile = await fsPromises.readFile(path.join(payload.projectPath, 'project.studio'), { encoding: 'utf-8' });
  const projectStudioParsed = PROJECT_VALIDATOR.safeParse(parseJSON(projectStudioFile, 'project.studio'));
  if (!projectStudioParsed.success) throw new Error('Fail to parse project.studio file');

  log.info('migrate-data/success');
  return { projectStudio: projectStudioParsed.data };
};

export const registerMigrateData = defineBackendServiceFunction('migrate-data', migrateData);
