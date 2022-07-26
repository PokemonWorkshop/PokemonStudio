import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import type { PSDKVersion } from '@services/getPSDKVersion';
import IpcService from '@services/IPC/ipc.service';
import { ProjectData, ProjectText, PSDKConfigs, SelectedDataIdentifier } from '@src/GlobalStateProvider';
import { TFunction } from 'react-i18next';
import { generateSelectedIdentifier } from './generateSelectedIdentifier';
import { getProjectPath, loadProjectText, loadProjectData, getProjectStudio, loadPSDKConfigs } from './IPCUtils';
import { LoaderContext } from './loaderContext';
import { deserializeConfig, deserializeProjectStudio, deserializeDataEntries } from './SerializationUtils';

type AllProjectData = {
  projectData: ProjectData;
  projectPath: string;
  projectText: ProjectText;
  projectStudio: ProjectStudioModel;
  projectConfig: PSDKConfigs;
  currentPSDKVersion: PSDKVersion;
  lastPSDKVersion: PSDKVersion;
  selectedDataIdentifier: SelectedDataIdentifier;
};

export const loadProject = async (
  IPC: IpcService,
  loaderRef: React.MutableRefObject<LoaderContext>,
  t: TFunction<'loader'>,
  projectPath?: string
): Promise<AllProjectData> => {
  const projectPathValue = projectPath ? { projectPath: projectPath } : await getProjectPath(IPC, 'studio');
  if ('error' in projectPathValue) throw new Error(projectPathValue.error);

  loaderRef.current.open('loading_project', 1, 10, t('loading_project_meta'));
  const projectStudioValue = await getProjectStudio(IPC, projectPathValue.projectPath);
  if ('error' in projectStudioValue) throw new Error(projectStudioValue.error);

  loaderRef.current.setProgress(2, 10, t('loading_project_meta_deserialization'));
  const projectStudio = deserializeProjectStudio(projectStudioValue.projectStudio);
  if (!projectStudio) throw new Error('Failed to parse project.studio file');

  loaderRef.current.setProgress(3, 10, t('loading_project_config'));
  const projectConfigValue = await loadPSDKConfigs(IPC, projectPathValue.projectPath);
  if ('error' in projectConfigValue) throw new Error(projectConfigValue.error);

  loaderRef.current.setProgress(4, 10, t('loading_project_config_deserialization'));
  const projectConfig: PSDKConfigs = {
    credits_config: deserializeConfig(projectConfigValue.projectConfig.credits_config),
    devices_config: deserializeConfig(projectConfigValue.projectConfig.devices_config),
    display_config: deserializeConfig(projectConfigValue.projectConfig.display_config),
    graphic_config: deserializeConfig(projectConfigValue.projectConfig.graphic_config),
    infos_config: deserializeConfig(projectConfigValue.projectConfig.infos_config),
    language_config: deserializeConfig(projectConfigValue.projectConfig.language_config),
    save_config: deserializeConfig(projectConfigValue.projectConfig.save_config),
    scene_title_config: deserializeConfig(projectConfigValue.projectConfig.scene_title_config),
    settings_config: deserializeConfig(projectConfigValue.projectConfig.settings_config),
    texts_config: deserializeConfig(projectConfigValue.projectConfig.texts_config),
    game_options_config: deserializeConfig(projectConfigValue.projectConfig.game_options_config),
    natures: deserializeConfig(projectConfigValue.projectConfig.natures),
  };

  loaderRef.current.setProgress(5, 10, t('loading_project_data'));
  const projectDataValue = await loadProjectData(IPC, projectPathValue.projectPath);
  if ('error' in projectDataValue) throw new Error(projectDataValue.error);

  loaderRef.current.setProgress(6, 10, t('loading_project_text'));
  const projectTextValue = await loadProjectText(IPC, projectPathValue.projectPath);
  if ('error' in projectTextValue) throw new Error(projectTextValue.error);

  const projectText = projectTextValue.projectText;

  loaderRef.current.setProgress(7, 10, t('loading_project_data_deserialization'));
  const projectData: ProjectData = {
    items: deserializeDataEntries(projectDataValue.projectData.items, projectText, projectConfig.language_config),
    moves: deserializeDataEntries(projectDataValue.projectData.moves, projectText, projectConfig.language_config),
    pokemon: deserializeDataEntries(projectDataValue.projectData.pokemon, projectText, projectConfig.language_config),
    quests: deserializeDataEntries(projectDataValue.projectData.quests, projectText, projectConfig.language_config),
    trainers: deserializeDataEntries(projectDataValue.projectData.trainers, projectText, projectConfig.language_config),
    types: deserializeDataEntries(projectDataValue.projectData.types, projectText, projectConfig.language_config),
    zones: deserializeDataEntries(projectDataValue.projectData.zones, projectText, projectConfig.language_config),
    abilities: deserializeDataEntries(projectDataValue.projectData.abilities, projectText, projectConfig.language_config),
    groups: deserializeDataEntries(projectDataValue.projectData.groups, projectText, projectConfig.language_config),
    dex: deserializeDataEntries(projectDataValue.projectData.dex, projectText, projectConfig.language_config),
  };

  loaderRef.current.setProgress(8, 10, t('loading_project_psdk_version'));
  const currentPSDKVersion = await window.api.getPSDKVersion();
  loaderRef.current.setProgress(9, 10, t('loading_project_last_psdk_version'));
  const lastPSDKVersion = await window.api.getLastPSDKVersion();

  loaderRef.current.setProgress(10, 10, t('loading_project_identifier'));
  const selectedDataIdentifier = generateSelectedIdentifier(projectData);

  return {
    projectData,
    projectText,
    projectPath: projectPathValue.projectPath,
    projectStudio: projectStudio,
    projectConfig,
    currentPSDKVersion,
    lastPSDKVersion,
    selectedDataIdentifier,
  };
};
