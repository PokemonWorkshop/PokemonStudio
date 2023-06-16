import { fixBeMethodMoveSelfStatus } from '@src/migrations/fixBeMethodMoveSelfStatus';
import { fixCsvFileIdDex } from '@src/migrations/fixCsvFileIdDex';
import { linkResourcesToCreatures } from '@src/migrations/linkResourcesToCreatures';
import { migrateHeadbutt } from '@src/migrations/migrateHeadbutt';
import { migrateMapLinks } from '@src/migrations/migrateMapLinks';
import { IpcMainEvent, IpcMain } from 'electron';

export type MigrationTask = (event: IpcMainEvent, projectPath: string) => Promise<void>;

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATIONS: Record<string, MigrationTask[]> = {
  '1.0.0': [migrateMapLinks, linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.0.1': [migrateMapLinks, linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.0.2': [migrateMapLinks, linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.1.0': [linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.1.1': [linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.2.0': [linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.3.0': [linkResourcesToCreatures, migrateHeadbutt, fixBeMethodMoveSelfStatus, fixCsvFileIdDex],
  '1.4.0': [fixCsvFileIdDex],
  '1.4.1': [fixCsvFileIdDex],
  '1.4.2': [fixCsvFileIdDex],
  '1.4.3': [fixCsvFileIdDex],
  '1.4.4': [fixCsvFileIdDex], // Don't forget to add the official version coming up
};

// Don't forget to extend those array with the new tasks that gets added by the time!
const MIGRATION_STEP_TEXTS: Record<string, string[]> = {
  '1.0.0': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.0.1': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.0.2': [
    'Migrate MapLinks',
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.1.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.1.1': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.2.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.3.0': [
    'Link the resources to the Pokémon',
    'Move Headbutt tool in the system tag',
    'Fix battle engine method of the moves',
    'Fix the csv file id of the dex',
  ],
  '1.4.0': ['Fix the csv file id of the dex'],
  '1.4.1': ['Fix the csv file id of the dex'],
  '1.4.2': ['Fix the csv file id of the dex'],
  '1.4.3': ['Fix the csv file id of the dex'],
  '1.4.4': ['Fix the csv file id of the dex'], // Don't forget to add the official version coming up
};

const migrateData = async (event: IpcMainEvent, payload: { projectPath: string; projectVersion: string }) => {
  console.info('migrate-data', payload.projectVersion);
  try {
    const dataToMigrate = MIGRATIONS[payload.projectVersion];
    const stepTexts = MIGRATION_STEP_TEXTS[payload.projectVersion];
    if (dataToMigrate && stepTexts) {
      console.info('migrate-data', `Found ${dataToMigrate.length} migrations`);
      await dataToMigrate.reduce(async (prev, curr, index) => {
        await prev;
        event.sender.send('migrate-data/progress', { step: index + 1, total: dataToMigrate.length, stepText: stepTexts[index] });
        await curr(event, payload.projectPath);
      }, Promise.resolve());
    } else {
      console.info('migrate-data', 'No data to migrate found!');
    }
    console.info('migrate-data/success');
    event.sender.send('migrate-data/success', {});
  } catch (error) {
    console.error('migrate-data/failure', error);
    event.sender.send('migrate-data/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerMigrateData = (ipcMain: IpcMain) => {
  ipcMain.on('migrate-data', migrateData);
};
