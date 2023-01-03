import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from './loaderContext';
import type { ProjectDataFromBackEnd } from '@src/backendTasks/readProjectData';
import { ProjectData, ProjectText, projectTextSave, PSDKConfigs, State, useGlobalState } from '@src/GlobalStateProvider';
import log from 'electron-log';
import { deserializeZodConfig, deserializeZodData, deserializeZodDiscriminatedData, zodDataToEntries } from './SerializationUtils';
import { generateSelectedIdentifier } from './generateSelectedIdentifier';
import { SavingConfigMap, SavingMap } from './SavingUtils';
import { addProjectToList, updateProjectStudio } from './projectList';
import { ABILITY_VALIDATOR } from '@modelEntities/ability';
import {
  CREDIT_CONFIG_VALIDATOR,
  DEVICES_CONFIG_VALIDATOR,
  DISPLAY_CONFIG_VALIDATOR,
  GAME_OPTION_CONFIG_VALIDATOR,
  GRAPHIC_CONFIG_VALIDATOR,
  INFO_CONFIG_VALIDATOR,
  LANGUAGE_CONFIG_VALIDATOR,
  NATURE_CONFIG_VALIDATOR,
  SAVE_CONFIG_VALIDATOR,
  SCENE_TITLE_CONFIG_VALIDATOR,
  SETTINGS_CONFIG_VALIDATOR,
  TEXT_CONFIG_VALIDATOR,
} from '@modelEntities/config';
import { DEX_VALIDATOR } from '@modelEntities/dex';
import { CREATURE_VALIDATOR } from '@modelEntities/creature';
import { ITEM_VALIDATOR } from '@modelEntities/item';
import { MOVE_VALIDATOR } from '@modelEntities/move';
import { GROUP_VALIDATOR } from '@modelEntities/group';
import { TRAINER_VALIDATOR } from '@modelEntities/trainer';
import { MAP_LINK_VALIDATOR } from '@modelEntities/mapLink';
import { ZONE_VALIDATOR } from '@modelEntities/zone';
import { TYPE_VALIDATOR } from '@modelEntities/type';
import { QUEST_VALIDATOR } from '@modelEntities/quest';
import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';

export type PreGlobalState = Omit<
  State,
  | 'selectedDataIdentifier'
  | 'savingData'
  | 'savingConfig'
  | 'savingProjectStudio'
  | 'currentPSDKVersion'
  | 'lastPSDKVersion'
  | 'projectPath'
  | 'savingLanguage'
  | 'savingImage'
> & { projectPath: string };
type ProjectLoadFailureCallback = (error: { errorMessage: string }) => void;
type ProjectLoadSuccessCallback = (payload: Record<string, never>) => void;
type ProjectLoadStateObject =
  | { state: 'done' | 'choosingProjectFile' }
  | { state: 'readingVersion'; projectDirName: string }
  | { state: 'readProjectMetadata'; projectDirName: string; studioVersion: string }
  | { state: 'writeProjectMetadata'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'updateMapInfos'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'readProjectConfigs'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | {
      state: 'readProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
    }
  | {
      state: 'readProjectText';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
    }
  | {
      state: 'deserializeProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
      projectTexts: ProjectText;
    }
  | { state: 'finalizeGlobalState'; preState: PreGlobalState };

const fail = (callbacks: { onFailure: ProjectLoadFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    log.error('Failed to load project', error);
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useProjectLoad = () => {
  const loaderRef = useLoaderRef();
  const [, setGlobalState] = useGlobalState();
  const { t: tl } = useTranslation('loader');
  const [callbacks, setCallbacks] = useState<{ onFailure: ProjectLoadFailureCallback; onSuccess: ProjectLoadSuccessCallback } | undefined>(undefined);
  const [state, setState] = useState<ProjectLoadStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupReadProjectConfigs();
        window.api.cleanupReadProjectData();
        window.api.cleanupReadProjectMetadata();
        window.api.cleanupReadProjectTexts();
        window.api.cleanupMigrateData();
        window.api.cleanupUpdateMapInfos();
        return;
      case 'choosingProjectFile':
        loaderRef.current.open('loading_project', 0, 0, tl('importing_project_choose_project'));
        return window.api.chooseProjectFileToOpen(
          { fileType: 'studio' },
          ({ dirName }) => setState({ state: 'readingVersion', projectDirName: dirName }),
          () => {
            setState({ state: 'done' });
            loaderRef.current.close();
          }
        );
      case 'readingVersion':
        loaderRef.current.setProgress(1, 13, tl('importing_project_reading_version'));
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'readProjectMetadata', studioVersion: projectVersion.studioVersion }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectMetadata':
        loaderRef.current.open('loading_project', 2, 13, tl('loading_project_meta'));
        return window.api.readProjectMetadata(
          { path: state.projectDirName },
          ({ metaData }) => {
            loaderRef.current.setProgress(3, 13, tl('loading_project_meta_deserialization'));
            const projectMetaData = PROJECT_VALIDATOR.safeParse(metaData);
            if (!projectMetaData.success) {
              loaderRef.current.setError('loading_project_error', 'Failed to deserialize'); // TODO: translate error text
              setState({ state: 'done' });
              return;
            }
            if (projectMetaData.data.studioVersion === state.studioVersion) {
              setState({ ...state, state: 'updateMapInfos', projectMetaData: projectMetaData.data });
            } else {
              if (projectMetaData.data.studioVersion.localeCompare(state.studioVersion) === 1) {
                loaderRef.current.setError(
                  'loading_project_error',
                  'Your project was opened or created with a newer version of the application. Please update Pokémon Studio.'
                ); // TODO: translate error text
                setState({ state: 'done' });
                return;
              }
              window.api.migrateData(
                { projectPath: state.projectDirName, projectVersion: projectMetaData.data.studioVersion },
                () => {
                  projectMetaData.data.studioVersion = state.studioVersion;
                  setState({ ...state, state: 'writeProjectMetadata', projectMetaData: projectMetaData.data });
                },
                ({ errorMessage }) => {
                  setState({ state: 'done' });
                  fail(callbacks, errorMessage);
                },
                (payload) => {
                  loaderRef.current.open('migrating_data', payload.step, payload.total, payload.stepText);
                }
              );
            }
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'writeProjectMetadata':
        loaderRef.current.open('loading_project', 4, 13, tl('importing_project_writing_meta'));
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData: state.projectMetaData },
          () => {
            setState({ ...state, state: 'updateMapInfos' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'updateMapInfos':
        loaderRef.current.setProgress(5, 13, tl('loading_update_map_infos'));
        return window.api.updateMapInfos(
          { projectPath: state.projectDirName },
          () => {
            setState({ ...state, state: 'readProjectConfigs' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectConfigs':
        loaderRef.current.setProgress(6, 13, tl('loading_project_config'));
        return window.api.readProjectConfigs(
          { path: state.projectDirName },
          (configs) => {
            loaderRef.current.setProgress(7, 13, tl('loading_project_config_deserialization'));
            try {
              const projectConfigs: PSDKConfigs = {
                credits_config: deserializeZodConfig(configs.credits_config, CREDIT_CONFIG_VALIDATOR),
                devices_config: deserializeZodConfig(configs.devices_config, DEVICES_CONFIG_VALIDATOR),
                display_config: deserializeZodConfig(configs.display_config, DISPLAY_CONFIG_VALIDATOR),
                graphic_config: deserializeZodConfig(configs.graphic_config, GRAPHIC_CONFIG_VALIDATOR),
                infos_config: deserializeZodConfig(configs.infos_config, INFO_CONFIG_VALIDATOR),
                language_config: deserializeZodConfig(configs.language_config, LANGUAGE_CONFIG_VALIDATOR),
                save_config: deserializeZodConfig(configs.save_config, SAVE_CONFIG_VALIDATOR),
                scene_title_config: deserializeZodConfig(configs.scene_title_config, SCENE_TITLE_CONFIG_VALIDATOR),
                settings_config: deserializeZodConfig(configs.settings_config, SETTINGS_CONFIG_VALIDATOR),
                texts_config: deserializeZodConfig(configs.texts_config, TEXT_CONFIG_VALIDATOR),
                game_options_config: deserializeZodConfig(configs.game_options_config, GAME_OPTION_CONFIG_VALIDATOR),
                natures: deserializeZodConfig(configs.natures, NATURE_CONFIG_VALIDATOR),
              };
              setState({ ...state, state: 'readProjectData', projectConfigs });
            } catch (error) {
              setState({ state: 'done' });
              fail(callbacks, error);
            }
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectData':
        loaderRef.current.setProgress(8, 13, tl('loading_project_data'));
        return window.api.readProjectData(
          { path: state.projectDirName },
          (projectData) => {
            setState({ ...state, state: 'readProjectText', projectData });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectText':
        loaderRef.current.setProgress(9, 13, tl('loading_project_text'));
        return window.api.readProjectTexts(
          { path: state.projectDirName },
          (projectTexts) => {
            setState({ ...state, state: 'deserializeProjectData', projectTexts });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'deserializeProjectData':
        loaderRef.current.setProgress(10, 13, tl('loading_project_data_deserialization'));
        try {
          const projectText = state.projectTexts;
          const projectData: ProjectData = {
            items: zodDataToEntries(deserializeZodDiscriminatedData(state.projectData.items, ITEM_VALIDATOR)),
            moves: zodDataToEntries(deserializeZodData(state.projectData.moves, MOVE_VALIDATOR)),
            pokemon: zodDataToEntries(deserializeZodData(state.projectData.pokemon, CREATURE_VALIDATOR)),
            quests: zodDataToEntries(deserializeZodData(state.projectData.quests, QUEST_VALIDATOR)),
            trainers: zodDataToEntries(deserializeZodData(state.projectData.trainers, TRAINER_VALIDATOR)),
            types: zodDataToEntries(deserializeZodData(state.projectData.types, TYPE_VALIDATOR)),
            zones: zodDataToEntries(deserializeZodData(state.projectData.zones, ZONE_VALIDATOR)),
            abilities: zodDataToEntries(deserializeZodData(state.projectData.abilities, ABILITY_VALIDATOR)),
            groups: zodDataToEntries(deserializeZodData(state.projectData.groups, GROUP_VALIDATOR)),
            dex: zodDataToEntries(deserializeZodData(state.projectData.dex, DEX_VALIDATOR)),
            mapLinks: zodDataToEntries(deserializeZodData(state.projectData.maplinks, MAP_LINK_VALIDATOR)),
          };
          setState({
            ...state,
            state: 'finalizeGlobalState',
            preState: {
              projectConfig: state.projectConfigs,
              projectData,
              projectPath: state.projectDirName,
              projectStudio: state.projectMetaData,
              projectText,
              rmxpMaps: state.projectData.rmxpMaps,
            },
          });
        } catch (error) {
          setState({ state: 'done' });
          fail(callbacks, error);
        }
        break;
      case 'finalizeGlobalState':
        // TODO: make a better version of that shit
        loaderRef.current.setProgress(11, 13, tl('loading_project_psdk_version'));
        window.api
          .getPSDKVersion()
          .then((currentPSDKVersion) => {
            loaderRef.current.setProgress(12, 13, tl('loading_project_last_psdk_version'));
            window.api
              .getLastPSDKVersion()
              .then((lastPSDKVersion) => {
                loaderRef.current.setProgress(13, 13, tl('loading_project_identifier'));
                const selectedDataIdentifier = generateSelectedIdentifier(state.preState);
                setGlobalState({
                  ...state.preState,
                  currentPSDKVersion,
                  lastPSDKVersion,
                  selectedDataIdentifier,
                  savingData: new SavingMap(),
                  savingConfig: new SavingConfigMap(),
                  savingProjectStudio: false,
                  savingLanguage: [],
                  savingImage: {},
                });
                projectTextSave.fill(false);
                addProjectToList({
                  projectStudio: state.preState.projectStudio,
                  projectPath: state.preState.projectPath,
                  lastEdit: new Date(),
                });
                updateProjectStudio(state.preState.projectPath, state.preState.projectStudio);
                setState({ state: 'done' });
                callbacks?.onSuccess({});
              })
              .catch((error) => {
                setState({ state: 'done' });
                fail(callbacks, error);
              });
          })
          .catch((error) => {
            setState({ state: 'done' });
            fail(callbacks, error);
          });
    }
  }, [state, callbacks]);

  return (payload: { projectDirName?: string }, onSuccess: ProjectLoadSuccessCallback, onFailure: ProjectLoadFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState(payload.projectDirName ? { state: 'readingVersion', projectDirName: payload.projectDirName } : { state: 'choosingProjectFile' });
  };
};
