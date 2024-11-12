import type { MigrationTask } from '@src/backendTasks/migrateData';
import { migrateMapLinks } from './migrateMapLinks';
import { linkResourcesToCreatures } from './linkResourcesToCreatures';
import { migrateHeadbutt } from './migrateHeadbutt';
import { fixBeMethodMoveSelfStatus } from './fixBeMethodMoveSelfStatus';
import { migrationV2 } from './migrationV2';
import { addAvailableLanguagesForTranslation } from './addAvailableLanguagesForTranslation';
import { addVolumeAndPitchInMaps } from './addVolumeAndPitchInMaps';
import { generatingMapOverviews } from './generatingMapOverviews';
import { addOtherLanguages } from './addOtherLanguages';
import { fixCreatureValuesAfterZodChange } from './fixCreatureValuesAfterZodChange';
import { addFormNamesDescriptions } from './addFormNamesDescriptions';
import { migrateNaturesToEntities } from './migrateNaturesToEntities';
import { migrateUndefinedBreedingGroupToUnknown } from './migrateUndefinedBreedingGroupToUnknown';

type MigrateConfigType = {
  migration: MigrationTask;
  version: string;
  message: string;
};

export const MIGRATION_CONFIG: MigrateConfigType[] = [
  {
    migration: migrateMapLinks,
    version: '1.0.2',
    message: 'Migrate MapLinks',
  },
  {
    migration: linkResourcesToCreatures,
    version: '1.3.0',
    message: 'Link the resources to the Pokémon',
  },
  {
    migration: migrateHeadbutt,
    version: '1.3.0',
    message: 'Move Headbutt tool in the system tag',
  },
  {
    migration: fixBeMethodMoveSelfStatus,
    version: '1.3.0',
    message: 'Fix battle engine method of the moves',
  },
  {
    migration: migrationV2,
    version: '1.4.4',
    message: 'Migration to version 2.0',
  },
  {
    migration: addAvailableLanguagesForTranslation,
    version: '2.0.3',
    message: 'Add available languages for translation',
  },
  {
    migration: addVolumeAndPitchInMaps,
    version: '2.0.3',
    message: 'Add the volume and the pitch in the maps',
  },
  {
    migration: generatingMapOverviews,
    version: '2.0.3',
    message: 'Generating map overviews',
  },
  {
    migration: addOtherLanguages,
    version: '2.1.0',
    message: 'Add basic languages',
  },
  {
    migration: fixCreatureValuesAfterZodChange,
    version: '2.2.2',
    message: 'Update creatures values after change in the values authorized',
  },
  {
    migration: addFormNamesDescriptions,
    version: '2.2.4',
    message: 'Update creatures and create CSV files to manage form names and descriptions',
  },
  {
    migration: migrateNaturesToEntities,
    version: '2.3.0',
    message: 'Migrate natures config to nature entities',
  },
  {
    migration: migrateUndefinedBreedingGroupToUnknown,
    version: '2.3.0',
    message: 'Migrate undefined breeding group to unknown breeding group',
  },
];
