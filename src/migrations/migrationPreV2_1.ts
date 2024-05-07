import { IpcMainEvent } from 'electron';
import { addAvailableLanguagesForTranslation } from './addAvailableLanguagesForTranslation';
import { addVolumeAndPitchInMaps } from './addVolumeAndPitchInMaps';
import { generatingMapOverviews } from './generatingMapOverviews';

const MIGRATION_PRE_V2_1 = [addAvailableLanguagesForTranslation, addVolumeAndPitchInMaps, generatingMapOverviews];

export const migrationPreV2_1 = async (event: IpcMainEvent, projectPath: string) => {
  await MIGRATION_PRE_V2_1.reduce(async (prev, curr) => {
    await prev;
    await curr(event, projectPath);
  }, Promise.resolve());
};
