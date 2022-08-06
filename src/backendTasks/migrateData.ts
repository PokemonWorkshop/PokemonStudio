import { migrateMapLinks } from '@src/migrations/migrateMapLinks';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';

export type MigrationTask = (event: IpcMainEvent, projectPath: string) => Promise<void>;

const MIGRATIONS: Record<string, MigrationTask[]> = {
  '1.0.0': [migrateMapLinks], // Don't forget to extend those array with the new tasks that gets added by the time!
  '1.0.1': [migrateMapLinks],
  '1.0.2': [migrateMapLinks], // Don't forget to add the official version coming up
};

const migrateData = async (event: IpcMainEvent, payload: { projectPath: string; projectVersion: string }) => {
  log.info('migrate-data', payload.projectVersion);
  try {
    const dataToMigrate = MIGRATIONS[payload.projectVersion];
    if (dataToMigrate) {
      log.info('migrate-data', `Found ${dataToMigrate.length} migrations`);
      await dataToMigrate.reduce(async (prev, curr, index) => {
        await prev;
        event.sender.send('migrate-data/progress', { step: index + 1, total: dataToMigrate.length, stepText: curr.name });
        await curr(event, payload.projectPath);
      }, Promise.resolve());
    } else {
      log.info('migrate-data', 'No data to migrate found!');
    }
    log.info('migrate-data/success');
    event.sender.send('migrate-data/success', {});
  } catch (error) {
    log.error('migrate-data/failure', error);
    event.sender.send('migrate-data/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerMigrateData = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('migrate-data', migrateData);
};
