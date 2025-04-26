import { IpcMainEvent } from 'electron';
import path from 'path';
import fsPromise from 'fs/promises';
import { parseJSON } from '@utils/json/parse';
import { SETTINGS_CONFIG_VALIDATOR, StudioSettingConfig } from '@modelEntities/config';

const PRE_MIGRATION_SETTINGS_CONFIG_VALIDATOR = SETTINGS_CONFIG_VALIDATOR.omit({ isUseBattleCamera3d: true });

export const addBattleCamera3dToSettings = async (_: IpcMainEvent, projectPath: string) => {
  const settingsFilePath = path.join(projectPath, 'Data/configs/settings_config.json');

  const settingsFile = await fsPromise.readFile(settingsFilePath, { encoding: 'utf-8' });
  const settingsFileParsed = PRE_MIGRATION_SETTINGS_CONFIG_VALIDATOR.safeParse(parseJSON(settingsFile, 'settings_config.json'));
  if (!settingsFileParsed.success) throw new Error('Fail to parse settings_config.json file');

  const newSettingsFile: StudioSettingConfig = {
    ...settingsFileParsed.data,
    isUseBattleCamera3d: false,
  };
  await fsPromise.writeFile(settingsFilePath, JSON.stringify(newSettingsFile, null, 2));
};
