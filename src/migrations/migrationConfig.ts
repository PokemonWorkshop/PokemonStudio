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
import { addTrainerAdditionalDialogs } from './addTrainerAdditionalDialogs';
import { migrateQuestsEarnings } from './migrateQuestsEarnings';
import { addCsvForQuestsCustomObjectives } from './addCsvForQuestsCustomObjectives';
import { addEggInCreatureResources } from './addEggInCreatureResources';
import { addBattleCamera3dToSettings } from './addBattleCamera3dToSettings';
import { migrateGroupsFor3v3BattleMode } from './migrateGroupsFor3v3BattleMode';
import { addMegaEvolutionParameterToItems } from './addMegaEvolutionParameterToItems';
import { addBerryAndCookingDataToItems } from './addBerryAndCookingDataToItems';
import { addSoundDesignConfig } from './addSoundDesignConfig';
import { addMoveContestData } from './addMoveContestData';
import { addMissingMapLinks } from './addMissingMapLinks';

type MigrateConfigType = {
  migration: MigrationTask;
  version: string;
  message: string;
};

/*
 * How add a migration
 *
 * Add the migration config in the array below with the following structure:
 * {
 *    migration: newMigration,
 *    version: '2.4.0',
 *    message: 'new_migration',
 * }
 *
 * migration: The method that must be called to do the migration.
 * version: The version of the project where the migration is to take place. The migration will also run if the project has a lower version.
 * message: A message will be displayed for the user to understand what is happening.
 *          You need to enter the translation key used by i18n.
 */

export const MIGRATION_CONFIG: MigrateConfigType[] = [
  {
    migration: migrateMapLinks,
    version: '1.0.2',
    message: 'migrate_maplinks',
  },
  {
    migration: linkResourcesToCreatures,
    version: '1.3.0',
    message: 'link_resources_to_creatures',
  },
  {
    migration: migrateHeadbutt,
    version: '1.3.0',
    message: 'move_headbutt_tool_in_systag',
  },
  {
    migration: fixBeMethodMoveSelfStatus,
    version: '1.3.0',
    message: 'fix_be_method',
  },
  {
    migration: migrationV2,
    version: '1.4.4',
    message: 'migration_to_version_2_0',
  },
  {
    migration: addAvailableLanguagesForTranslation,
    version: '2.0.3',
    message: 'add_available_languages_for_translation',
  },
  {
    migration: addVolumeAndPitchInMaps,
    version: '2.0.3',
    message: 'add_volume_and_pitch_in_maps',
  },
  {
    migration: generatingMapOverviews,
    version: '2.0.3',
    message: 'generating_map_overviews',
  },
  {
    migration: addOtherLanguages,
    version: '2.1.0',
    message: 'add_basic_languages',
  },
  {
    migration: fixCreatureValuesAfterZodChange,
    version: '2.2.2',
    message: 'update_creatures_after_zod_change',
  },
  {
    migration: addFormNamesDescriptions,
    version: '2.2.4',
    message: 'update_creatures_to_manage_form',
  },
  {
    migration: migrateNaturesToEntities,
    version: '2.3.0',
    message: 'migrate_natures',
  },
  {
    migration: migrateUndefinedBreedingGroupToUnknown,
    version: '2.3.0',
    message: 'migrate_breeding_group',
  },
  {
    migration: addTrainerAdditionalDialogs,
    version: '2.4.0',
    message: 'add_trainer_additional_dialogs',
  },
  {
    migration: migrateQuestsEarnings,
    version: '2.4.1',
    message: 'migrate_quests_earnings',
  },
  {
    migration: addCsvForQuestsCustomObjectives,
    version: '2.4.2',
    message: 'add_csv_quests_custom_objectives',
  },
  {
    migration: addEggInCreatureResources,
    version: '2.4.3',
    message: 'add_egg_in_creature_resources',
  },
  {
    migration: addBattleCamera3dToSettings,
    version: '2.4.3',
    message: 'add_battle_camera_3D_to_settings',
  },
  {
    migration: migrateGroupsFor3v3BattleMode,
    version: '2.5.0',
    message: 'migrate_groups_for_3v3_battle_mode',
  },
  {
    migration: addMegaEvolutionParameterToItems,
    version: '2.5.1',
    message: 'add_mega_evolution_parameter_to_items',
  },
  {
    migration: addSoundDesignConfig,
    version: '2.5.1',
    message: 'add_sound_design_config',
  },
  {
    migration: addBerryAndCookingDataToItems,
    version: '2.6.1',
    message: 'add_berry_and_cooking_data_to_items',
  },
  {
    migration: addMoveContestData,
    version: '2.6.1',
    message: 'add_move_contest_data',
  },
  {
    migration: addMissingMapLinks,
    version: '2.7.0',
    message: 'add_missing_maplinks',
  },
];
