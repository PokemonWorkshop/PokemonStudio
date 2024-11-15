import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import fsPromises from 'fs/promises';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';
import type { StudioSettings } from '@utils/settings';
import { parseJSON } from '@utils/json/parse';
import { MIGRATION_CONFIG } from '@src/migrations/migrationConfig';
import { backendTranslation } from '@utils/backendTranslation';

export type MigrationTask = (event: IpcMainEvent, projectPath: string, studioSettings?: StudioSettings) => Promise<void>;

export type MigrateDataInput = { projectPath: string; projectVersion: string; studioSettings: StudioSettings };
export type MigrateDataOutput = { projectStudio: StudioProject };

const migrateData = async (payload: MigrateDataInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('migrate-data', `Current project version: ${payload.projectVersion}`);

  const migrationFound = MIGRATION_CONFIG.filter((migration) => migration.version.localeCompare(payload.projectVersion) === 1);
  if (migrationFound.length > 0) {
    log.info('migrate-data', `Found ${migrationFound.length} migrations`);
    await migrationFound.reduce(async (prev, curr, index) => {
      await prev;
      const message = await backendTranslation(curr.message, { ns: 'migration' });
      log.info('migrate-data/progress', message);
      sendProgress(event, channels, { step: index + 1, total: migrationFound.length, stepText: message });
      await curr.migration(event, payload.projectPath, payload.studioSettings);
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
