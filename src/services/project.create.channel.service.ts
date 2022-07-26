import { app, dialog, IpcMainEvent } from 'electron';
import AbstractIpcChannel from './IPC/abstract.ipc.channel';
import { IpcRequest } from './IPC/ipc.request';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import extract from 'extract-zip';
import path from 'path';
import { generatePSDKBatFileContent } from './generatePSDKBatFileContent';
import { TypedJSON } from 'typedjson';
import InfosConfigModel from '@modelEntities/config/InfosConfig.model';
import log from 'electron-log';
import GameOptionsConfigModel from '@modelEntities/config/GameOptionsConfig.model';

const PSDK_PROJECT_PATH = 'new-project.zip';

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

interface ProjectCreateParameters extends IpcRequest {
  projectData: string;
  languageConfig: string;
  projectTitle: string;
  iconPath: string | undefined;
  multiLanguage: boolean;
}

const getAppPath = () => {
  const appPath = app.getAppPath().replaceAll('\\', '/');
  if (appPath.endsWith('resources/app.asar')) return appPath.replace(/resources\/app\.asar$/, '');
  if (appPath.endsWith('src')) return appPath.replace(/src$/, '');

  return appPath;
};
export default class ProjectCreateChannelService extends AbstractIpcChannel {
  channelName = 'project-create';

  async handle(event: IpcMainEvent, request: ProjectCreateParameters): Promise<void> {
    const responseChannel = request.responseChannel || `${this.name}_response`;
    request.responseChannel = responseChannel;

    log.info('create-project');
    return dialog
      .showOpenDialog({
        properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
      })
      .then(async (result) => {
        log.info('create-project-open-dialog-result', result);
        const dir = path.join(result.filePaths[0], request.projectTitle);
        if (existsSync(dir)) throw Error('creating_project_child_folder_exist_error');

        log.info('create-project creating directory');
        mkdirSync(dir);
        event.sender.send('project-create/status', 2, 3, 'creating_project_extraction');
        log.info('create-project extraction');

        await extract(path.join(getAppPath(), PSDK_PROJECT_PATH), { dir: dir });
        event.sender.send('project-create/status', 3, 3, 'creating_project_configuration');
        log.info('create-project writing configurations');
        writeFileSync(path.join(dir, 'project.studio'), request.projectData);
        writeFileSync(path.join(dir, 'Data/configs/language_config.json'), request.languageConfig);
        copyFileSync(request.iconPath || path.join(dir, 'graphics/icons/game.png'), path.join(dir, 'project_icon.png'));
        writeFileSync(path.join(dir, 'psdk.bat'), generatePSDKBatFileContent());
        updateInfosConfig(path.join(dir, 'Data/configs/infos_config.json'), request.projectTitle);
        if (!request.multiLanguage) updateGameOptionsConfig(path.join(dir, 'Data/configs/game_options_config.json'));
        log.info('create-project success');
        return dir;
      })
      .then((dir) => event.sender.send(responseChannel, { path: dir }))
      .catch((error) => {
        log.error('create-project failure', error);
        event.sender.send(responseChannel, { error: `Failed to create new project: ${error}` });
      });
  }
}
