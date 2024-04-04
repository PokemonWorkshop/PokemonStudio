import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { migrateMapLinks } from '@src/migrations/migrateMapLinks';
import { migrationV2 } from '@src/migrations/migrationV2';
import { migrationPreV2 } from '@src/migrations/migrationPreV2';
import { addAvailableLanguagesForTranslation } from '@src/migrations/addAvailableLanguagesForTranslation';
import { addVolumeAndPitchInMaps } from '@src/migrations/addVolumeAndPitchInMaps';
import fsPromises from 'fs/promises';
import path from 'path';
import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';
import { generatingMapOverviews } from '@src/migrations/generatingMapOverviews';
import type { StudioSettings } from '@utils/settings';

export type MigrationTask = (event: IpcMainEvent, projectPath: string, ...args: string[]) => Promise<void>;

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATIONS: Record<string, MigrationTask[]> = {
  '1.0.0': [migrateMapLinks, migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.0.1': [migrateMapLinks, migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.0.2': [migrateMapLinks, migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.1.0': [migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.1.1': [migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.2.0': [migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.3.0': [migrationPreV2, migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.4.0': [migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.4.1': [migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.4.2': [migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.4.3': [migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '1.4.4': [migrationV2, addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '2.0.0': [addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '2.0.1': [addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '2.0.2': [addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews],
  '2.0.3': [addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews], // Don't forget to add the official version coming up
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
  ],
  '1.1.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.1.1': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.2.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.3.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.4.0': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.4.1': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.4.2': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.4.3': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '1.4.4': [
    'Migration to version 2.0',
    'Add available languages for translation',
    'Add the volume and the pitch in the maps',
    'Generating map overviews',
  ],
  '2.0.0': ['Add available languages for translation', 'Add the volume and the pitch in the maps', 'Generating map overviews'],
  '2.0.1': ['Add available languages for translation', 'Add the volume and the pitch in the maps', 'Generating map overviews'],
  '2.0.2': ['Add available languages for translation', 'Add the volume and the pitch in the maps', 'Generating map overviews'],
  '2.0.3': ['Add available languages for translation', 'Add the volume and the pitch in the maps', 'Generating map overviews'], // Don't forget to add the official version coming up
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
      if (curr.name === 'generatingMapOverviews') {
        await curr(event, payload.projectPath, payload.studioSettings.tiledPath);
      } else {
        await curr(event, payload.projectPath);
      }
    }, Promise.resolve());
  } else {
    log.info('migrate-data', 'No data to migrate found!');
  }
  const projectStudioFile = await fsPromises.readFile(path.join(payload.projectPath, 'project.studio'), { encoding: 'utf-8' });
  const projectStudioParsed = PROJECT_VALIDATOR.safeParse(JSON.parse(projectStudioFile));
  if (!projectStudioParsed.success) throw new Error('Fail to parse project.studio file');

  log.info('migrate-data/success');
  return { projectStudio: projectStudioParsed.data };
};

export const registerMigrateData = defineBackendServiceFunction('migrate-data', migrateData);
