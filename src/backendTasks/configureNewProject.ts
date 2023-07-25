import { generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import log from 'electron-log';
import path from 'path';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { GAME_OPTION_CONFIG_VALIDATOR, INFO_CONFIG_VALIDATOR } from '@modelEntities/config';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ConfigureNewProjectMetaData = {
  projectStudioData: string;
  languageConfig: string;
  projectTitle: string;
  iconPath: string | undefined;
  multiLanguage: boolean;
};

const updateInfosConfig = (infosConfigPath: string, projectTitle: string) => {
  if (!existsSync(infosConfigPath)) throw new Error('infos_config.json file not found');

  const infosConfigContent = readFileSync(infosConfigPath).toString('utf-8');
  const infosConfig = INFO_CONFIG_VALIDATOR.safeParse(JSON.parse(infosConfigContent));
  if (!infosConfig.success) throw new Error('Fail to parse infos_config.json');

  infosConfig.data.gameTitle = projectTitle;
  writeFileSync(infosConfigPath, JSON.stringify(infosConfig.data, null, 2));
};

const updateGameOptionsConfig = (gameOptionsConfigPath: string) => {
  if (!existsSync(gameOptionsConfigPath)) throw new Error('game_options_config.json file not found');

  const gameOptionsConfigContent = readFileSync(gameOptionsConfigPath).toString('utf-8');
  const gameOptionConfigValidation = GAME_OPTION_CONFIG_VALIDATOR.safeParse(JSON.parse(gameOptionsConfigContent));
  if (!gameOptionConfigValidation.success) throw new Error('Fail to parse game_options_config.json');

  gameOptionConfigValidation.data.order = gameOptionConfigValidation.data.order.filter((k) => k !== 'language');
  writeFileSync(gameOptionsConfigPath, JSON.stringify(gameOptionConfigValidation.data, null, 2));
};

export type ConfigureNewProjectInput = { projectDirName: string; metaData: ConfigureNewProjectMetaData };

const configureNewProject = async (payload: ConfigureNewProjectInput) => {
  log.info('configure-new-project', payload);
  log.info('configure-new-project/create project.studio file');
  writeFileSync(path.join(payload.projectDirName, 'project.studio'), payload.metaData.projectStudioData);
  log.info('configure-new-project/create psdk.bat file');
  writeFileSync(path.join(payload.projectDirName, 'psdk.bat'), generatePSDKBatFileContent());
  log.info('configure-new-project/update icon');
  copyFileSync(
    payload.metaData.iconPath || path.join(payload.projectDirName, 'graphics/icons/game.png'),
    path.join(payload.projectDirName, 'project_icon.png')
  );
  log.info('configure-new-project/update language config');
  writeFileSync(path.join(payload.projectDirName, 'Data/configs/language_config.json'), payload.metaData.languageConfig);
  log.info('configure-new-project/update infos config');
  updateInfosConfig(path.join(payload.projectDirName, 'Data/configs/infos_config.json'), payload.metaData.projectTitle);
  if (!payload.metaData.multiLanguage) {
    log.info('configure-new-project/update game options config');
    updateGameOptionsConfig(path.join(payload.projectDirName, 'Data/configs/game_options_config.json'));
  }
  return {};
};

export const registerConfigureNewProject = defineBackendServiceFunction('configure-new-project', configureNewProject);
