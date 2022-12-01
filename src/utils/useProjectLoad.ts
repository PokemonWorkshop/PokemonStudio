import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from './loaderContext';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import type { ProjectDataFromBackEnd } from '@src/backendTasks/readProjectData';
import { ProjectData, ProjectText, PSDKConfigs, State, useGlobalState } from '@src/GlobalStateProvider';
import { TypedJSON } from 'typedjson';
import { deserializeConfig, deserializeDataArray } from './SerializationUtils';
import { generateSelectedIdentifier } from './generateSelectedIdentifier';
import { SavingConfigMap, SavingMap } from './SavingUtils';
import { addProjectToList, updateProjectStudio } from './projectList';

export type PreGlobalState = Omit<
  State,
  'selectedDataIdentifier' | 'savingData' | 'savingConfig' | 'savingProjectStudio' | 'currentPSDKVersion' | 'lastPSDKVersion' | 'projectPath'
> & { projectPath: string };
type ProjectLoadFailureCallback = (error: { errorMessage: string }) => void;
type ProjectLoadSuccessCallback = (payload: {}) => void;
type ProjectLoadStateObject =
  | { state: 'done' | 'choosingProjectFile' }
  | { state: 'readingVersion'; projectDirName: string }
  | { state: 'readProjectMetadata'; projectDirName: string; studioVersion: string }
  | { state: 'writeProjectMetadata'; projectDirName: string; studioVersion: string; projectMetaData: ProjectStudioModel }
  | { state: 'updateMapInfos'; projectDirName: string; studioVersion: string; projectMetaData: ProjectStudioModel }
  | { state: 'readProjectConfigs'; projectDirName: string; studioVersion: string; projectMetaData: ProjectStudioModel }
  | {
      state: 'readProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: ProjectStudioModel;
      projectConfigs: PSDKConfigs;
    }
  | {
      state: 'readProjectText';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: ProjectStudioModel;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
    }
  | {
      state: 'deserializeProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: ProjectStudioModel;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
      projectTexts: ProjectText;
    }
  | { state: 'finalizeGlobalState'; preState: PreGlobalState };

const fail = (callbacks: { onFailure: ProjectLoadFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
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
            const projectMetaData = new TypedJSON(ProjectStudioModel).parse(metaData);
            if (!projectMetaData) {
              loaderRef.current.setError('loading_project_error', 'Failed to deserialize'); // TODO: translate error text
              setState({ state: 'done' });
              return;
            }
            if (projectMetaData.studioVersion === state.studioVersion) setState({ ...state, state: 'updateMapInfos', projectMetaData });
            else {
              if (projectMetaData.studioVersion.localeCompare(state.studioVersion) === 1) {
                loaderRef.current.setError(
                  'loading_project_error',
                  'Your project was opened or created with a newer version of the application. Please update Pokémon Studio.'
                ); // TODO: translate error text
                setState({ state: 'done' });
                return;
              }
              window.api.migrateData(
                { projectPath: state.projectDirName, projectVersion: projectMetaData.studioVersion },
                () => {
                  projectMetaData.studioVersion = state.studioVersion;
                  setState({ ...state, state: 'writeProjectMetadata', projectMetaData });
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
        const { clone: _, ...metaData } = state.projectMetaData;
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData },
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
                credits_config: deserializeConfig(JSON.parse(configs.credits_config)),
                devices_config: deserializeConfig(JSON.parse(configs.devices_config)),
                display_config: deserializeConfig(JSON.parse(configs.display_config)),
                graphic_config: deserializeConfig(JSON.parse(configs.graphic_config)),
                infos_config: deserializeConfig(JSON.parse(configs.infos_config)),
                language_config: deserializeConfig(JSON.parse(configs.language_config)),
                save_config: deserializeConfig(JSON.parse(configs.save_config)),
                scene_title_config: deserializeConfig(JSON.parse(configs.scene_title_config)),
                settings_config: deserializeConfig(JSON.parse(configs.settings_config)),
                texts_config: deserializeConfig(JSON.parse(configs.texts_config)),
                game_options_config: deserializeConfig(JSON.parse(configs.game_options_config)),
                natures: deserializeConfig(JSON.parse(configs.natures)),
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
          const languageConfig = state.projectConfigs.language_config;
          const projectData: ProjectData = {
            items: deserializeDataArray(state.projectData.items, projectText, languageConfig),
            moves: deserializeDataArray(state.projectData.moves, projectText, languageConfig),
            pokemon: deserializeDataArray(state.projectData.pokemon, projectText, languageConfig),
            quests: deserializeDataArray(state.projectData.quests, projectText, languageConfig),
            trainers: deserializeDataArray(state.projectData.trainers, projectText, languageConfig),
            types: deserializeDataArray(state.projectData.types, projectText, languageConfig),
            zones: deserializeDataArray(state.projectData.zones, projectText, languageConfig),
            abilities: deserializeDataArray(state.projectData.abilities, projectText, languageConfig),
            groups: deserializeDataArray(state.projectData.groups, projectText, languageConfig),
            dex: deserializeDataArray(state.projectData.dex, projectText, languageConfig),
            mapLinks: deserializeDataArray(state.projectData.maplinks, projectText, languageConfig),
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
