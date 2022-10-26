import InfosConfigModel from '@modelEntities/config/InfosConfig.model';
import { generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import Electron, { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { TypedJSON } from 'typedjson';
import GameOptionsConfigModel from '@modelEntities/config/GameOptionsConfig.model';

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
  const serializer = new TypedJSON(InfosConfigModel);
  const infosConfig = serializer.parse(infosConfigContent);
  if (!infosConfig) throw new Error('Fail to parse infos_config.json');

  infosConfig.gameTitle = projectTitle;
  writeFileSync(infosConfigPath, serializer.stringify(infosConfig));
};

const updateGameOptionsConfig = (gameOptionsConfigPath: string) => {
  if (!existsSync(gameOptionsConfigPath)) throw new Error('game_options_config.json file not found');

  const gameOptionsConfigContent = readFileSync(gameOptionsConfigPath).toString('utf-8');
  const serializer = new TypedJSON(GameOptionsConfigModel);
  const gameOptionsConfig = serializer.parse(gameOptionsConfigContent);
  if (!gameOptionsConfig) throw new Error('Fail to parse game_options_config.json');

  gameOptionsConfig.removeKeyOfOrder('language');
  writeFileSync(gameOptionsConfigPath, serializer.stringify(gameOptionsConfig));
};

const configureNewProject = (event: IpcMainEvent, payload: { projectDirName: string; metaData: ConfigureNewProjectMetaData }) => {
  log.info('configure-new-project', payload);
  try {
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
    return event.sender.send('configure-new-project/success', {});
  } catch (error) {
    log.error('configure-new-project/failure', error);
    event.sender.send('configure-new-project/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerConfigureNewProject = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('configure-new-project', configureNewProject);
};
