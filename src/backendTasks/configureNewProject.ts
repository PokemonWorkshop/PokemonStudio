import { generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import log from 'electron-log';
import path from 'path';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { GAME_OPTION_CONFIG_VALIDATOR, INFO_CONFIG_VALIDATOR, StudioLanguageConfig } from '@modelEntities/config';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { addColumnCSV, getTextFileList, getTextPath, languageAvailable, loadCSV, saveCSV } from '@utils/textManagement';
import { readProjectFolder } from './readProjectData';
import { MAP_VALIDATOR } from '@modelEntities/map';
import fsPromise from 'fs/promises';

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

/**
 * Update the csv files to add missing languages if necessary
 */
const updateCSVFiles = async (projectPath: string, languageConfigData: string) => {
  const languageConfig = JSON.parse(languageConfigData) as StudioLanguageConfig;
  const textFileList = getTextFileList(projectPath, true);
  await textFileList.reduce(async (lastPromise, fileId) => {
    await lastPromise;

    const textPath = path.join(projectPath, getTextPath(fileId), `${fileId}.csv`);
    const csvData = await loadCSV(textPath);
    let shouldBeSaved = false;
    languageConfig.choosableLanguageCode.forEach((languageCode) => {
      if (!languageAvailable(languageCode, csvData)) {
        addColumnCSV(languageCode, csvData);
        shouldBeSaved = true;
      }
    });
    if (shouldBeSaved) {
      log.info('configure-new-project/update', 'CSV Files', textPath);
      saveCSV(textPath, csvData);
    }
  }, Promise.resolve());
};

/**
 * Update the mtime of the maps
 */
const updateMapsMtime = async (projectPath: string) => {
  const maps = await readProjectFolder(projectPath, 'maps');
  const mtime = new Date().getTime();
  await maps.reduce(async (lastPromise, map) => {
    await lastPromise;
    const mapParsed = MAP_VALIDATOR.safeParse(JSON.parse(map));
    if (mapParsed.success) {
      mapParsed.data.mtime = mtime;
      await fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/maps', `${mapParsed.data.dbSymbol}.json`),
        JSON.stringify(mapParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
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
  log.info('configure-new-project/update', 'CSV Files');
  await updateCSVFiles(payload.projectDirName, payload.metaData.languageConfig);
  log.info('configure-new-project/update', 'Maps mtime');
  await updateMapsMtime(payload.projectDirName);
  return {};
};

export const registerConfigureNewProject = defineBackendServiceFunction('configure-new-project', configureNewProject);
