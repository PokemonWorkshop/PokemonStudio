import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from './loaderContext';
import type { ProjectDataFromBackEnd } from '@src/backendTasks/readProjectData';
import { ProjectData, ProjectText, PSDKConfigs, State, useGlobalState } from '@src/GlobalStateProvider';
import log from 'electron-log';
import { deserializeZodConfig, deserializeZodData, deserializeZodDiscriminatedData, zodDataToEntries } from './SerializationUtils';
import { generateSelectedIdentifier } from './generateSelectedIdentifier';
import { SavingConfigMap, SavingMap, SavingTextMap } from './SavingUtils';
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
import { z } from 'zod';
import { buildSelectOptionsFromScratch, buildSelectOptionsTextSourcesFromScratch } from './useSelectOptions';
import i18n from '@src/i18n';
import { useDefaultTextInfoTranslation } from './useDefaultTextInfoTranslation';
import { PSDKVersion } from '@services/getPSDKVersion';
import { MAP_VALIDATOR } from '@modelEntities/map';
import { DbSymbol } from '@modelEntities/dbSymbol';

export type PreGlobalState = Omit<
  State,
  | 'selectedDataIdentifier'
  | 'savingData'
  | 'savingConfig'
  | 'savingText'
  | 'savingProjectStudio'
  | 'currentPSDKVersion'
  | 'lastPSDKVersion'
  | 'projectPath'
  | 'savingLanguage'
  | 'savingImage'
  | 'savingTextInfos'
  | 'mapsModified'
> & { projectPath: string };
type ProjectLoadFailureCallback = (error: { errorMessage: string }) => void;
type ProjectLoadSuccessCallback = (payload: Record<string, never>) => void;
type ProjectLoadIntegrityFailureCallback = (count: number) => void;
type ProjectLoadStateObject =
  | { state: 'done' | 'choosingProjectFile' }
  | { state: 'readingVersion'; projectDirName: string }
  | { state: 'readProjectMetadata'; projectDirName: string; studioVersion: string }
  | { state: 'writeProjectMetadata'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'updateMapInfos'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'updateTextInfos'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
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
  | { state: 'checkMapsModified'; preState: PreGlobalState; integrityFailureCount: number }
  | { state: 'readCurrentPSDKVersion'; preState: PreGlobalState; integrityFailureCount: number; mapsModified: DbSymbol[] }
  | {
      state: 'checkLastPSDKVersion';
      preState: PreGlobalState;
      integrityFailureCount: number;
      mapsModified: DbSymbol[];
      currentPSDKVersion: PSDKVersion;
    }
  | {
      state: 'finalizeGlobalState';
      preState: PreGlobalState;
      integrityFailureCount: number;
      mapsModified: DbSymbol[];
      currentPSDKVersion: PSDKVersion;
      lastPSDKVersion: PSDKVersion;
    }
  | { state: 'openProject' };

const fail = (callbacks: { onFailure: ProjectLoadFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    log.error('Failed to load project', error);
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

const countZodDataIntegrityFailure = <I extends z.ZodRawShape>(inputObjects: string[], validator: z.ZodObject<I>, count: { count: number }) => {
  const result = deserializeZodData(inputObjects, validator);
  count.count += result.integrityFailureCount.count;
  return result.input;
};

const countZodDiscriminatedDataIntegrityFailure = <K extends string, Options extends z.ZodDiscriminatedUnionOption<K>[]>(
  inputObjects: string[],
  validator: z.ZodDiscriminatedUnion<K, Options>,
  count: { count: number }
) => {
  const result = deserializeZodDiscriminatedData(inputObjects, validator);
  count.count += result.integrityFailureCount.count;
  return result.input;
};

export const useProjectLoad = () => {
  const loaderRef = useLoaderRef();
  const [, setGlobalState] = useGlobalState();
  const defaultTextInfoTranslation = useDefaultTextInfoTranslation();
  const { t: tl } = useTranslation('loader');
  const [callbacks, setCallbacks] = useState<
    | { onFailure: ProjectLoadFailureCallback; onSuccess: ProjectLoadSuccessCallback; onIntegrityFailure: ProjectLoadIntegrityFailureCallback }
    | undefined
  >(undefined);
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
        window.api.cleanupUpdateTextInfos();
        window.api.cleanupCheckMapsModified();
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
        loaderRef.current.setProgress(1, 15, tl('importing_project_reading_version'));
        window.api.clearCache();
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'readProjectMetadata', studioVersion: projectVersion.studioVersion }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectMetadata':
        loaderRef.current.open('loading_project', 2, 15, tl('loading_project_meta'));
        return window.api.readProjectMetadata(
          { path: state.projectDirName },
          ({ metaData }) => {
            loaderRef.current.setProgress(3, 15, tl('loading_project_meta_deserialization'));
            const projectMetaData = PROJECT_VALIDATOR.safeParse(metaData);
            if (!projectMetaData.success) {
              loaderRef.current.setError('loading_project_error', tl('failed_deserialize'));
              setState({ state: 'done' });
              return;
            }
            if (projectMetaData.data.studioVersion === state.studioVersion) {
              setState({ ...state, state: 'updateMapInfos', projectMetaData: projectMetaData.data });
            } else {
              if (projectMetaData.data.studioVersion.localeCompare(state.studioVersion) === 1) {
                loaderRef.current.setError('loading_project_error', tl('error_project_version'));
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
        loaderRef.current.open('loading_project', 4, 15, tl('importing_project_writing_meta'));
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData: JSON.stringify(state.projectMetaData, null, 2) },
          () => {
            setState({ ...state, state: 'updateMapInfos' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'updateMapInfos':
        loaderRef.current.setProgress(5, 15, tl('loading_update_map_infos'));
        return window.api.updateMapInfos(
          { projectPath: state.projectDirName },
          () => {
            setState({ ...state, state: 'updateTextInfos' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'updateTextInfos':
        loaderRef.current.setProgress(6, 15, tl('loading_update_text_infos'));
        return window.api.updateTextInfos(
          { projectPath: state.projectDirName, currentLanguage: i18n.language, textInfoTranslation: defaultTextInfoTranslation() },
          () => {
            setState({ ...state, state: 'readProjectConfigs' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readProjectConfigs':
        loaderRef.current.setProgress(7, 15, tl('loading_project_config'));
        return window.api.readProjectConfigs(
          { path: state.projectDirName },
          (configs) => {
            loaderRef.current.setProgress(8, 15, tl('loading_project_config_deserialization'));
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
        loaderRef.current.setProgress(9, 15, tl('loading_project_data'));
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
        loaderRef.current.setProgress(10, 15, tl('loading_project_text'));
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
        loaderRef.current.setProgress(11, 15, tl('loading_project_data_deserialization'));
        try {
          const integrityFailureCount = { count: 0 };
          const projectText = state.projectTexts;
          const projectData: ProjectData = {
            items: zodDataToEntries(countZodDiscriminatedDataIntegrityFailure(state.projectData.items, ITEM_VALIDATOR, integrityFailureCount)),
            moves: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.moves, MOVE_VALIDATOR, integrityFailureCount)),
            pokemon: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.pokemon, CREATURE_VALIDATOR, integrityFailureCount)),
            quests: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.quests, QUEST_VALIDATOR, integrityFailureCount)),
            trainers: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.trainers, TRAINER_VALIDATOR, integrityFailureCount)),
            types: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.types, TYPE_VALIDATOR, integrityFailureCount)),
            zones: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.zones, ZONE_VALIDATOR, integrityFailureCount)),
            abilities: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.abilities, ABILITY_VALIDATOR, integrityFailureCount)),
            groups: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.groups, GROUP_VALIDATOR, integrityFailureCount)),
            dex: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.dex, DEX_VALIDATOR, integrityFailureCount)),
            mapLinks: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.maplinks, MAP_LINK_VALIDATOR, integrityFailureCount)),
            maps: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.maps, MAP_VALIDATOR, integrityFailureCount)),
          };
          setState({
            ...state,
            state: 'checkMapsModified',
            preState: {
              projectConfig: state.projectConfigs,
              projectData,
              projectPath: state.projectDirName,
              projectStudio: state.projectMetaData,
              projectText,
              rmxpMaps: state.projectData.rmxpMaps,
              textInfos: state.projectData.textInfos,
              textVersion: 0,
            },
            integrityFailureCount: integrityFailureCount.count,
          });
        } catch (error) {
          setState({ state: 'done' });
          fail(callbacks, error);
        }
        break;
      case 'checkMapsModified':
        loaderRef.current.setProgress(12, 15, tl('loading_check_maps_modified'));
        window.api.checkMapsModified(
          {
            projectPath: state.preState.projectPath,
            maps: Object.values(state.preState.projectData.maps).map((map) => JSON.stringify(map)),
            method: 'sha1',
          },
          ({ dbSymbols }) => setState({ ...state, state: 'readCurrentPSDKVersion', mapsModified: dbSymbols }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
        break;
      case 'readCurrentPSDKVersion':
        loaderRef.current.setProgress(13, 15, tl('loading_project_psdk_version'));
        window.api
          .getPSDKVersion()
          .then((currentPSDKVersion) => {
            setState({ ...state, state: 'checkLastPSDKVersion', currentPSDKVersion });
          })
          .catch((error) => {
            setState({ state: 'done' });
            fail(callbacks, error);
          });
        break;
      case 'checkLastPSDKVersion':
        loaderRef.current.setProgress(14, 15, tl('loading_project_last_psdk_version'));
        window.api
          .getLastPSDKVersion()
          .then((lastPSDKVersion) => {
            setState({ ...state, state: 'finalizeGlobalState', lastPSDKVersion });
          })
          .catch((error) => {
            setState({ state: 'done' });
            fail(callbacks, error);
          });
        break;
      case 'finalizeGlobalState': {
        loaderRef.current.setProgress(15, 15, tl('loading_project_identifier'));
        sessionStorage.clear(); // Clear the whole session storage when loading is done so we don't carry garbage from other projects
        const selectedDataIdentifier = generateSelectedIdentifier(state.preState);
        const globalState = {
          ...state.preState,
          currentPSDKVersion: state.currentPSDKVersion,
          lastPSDKVersion: state.lastPSDKVersion,
          selectedDataIdentifier,
          savingData: new SavingMap(),
          savingConfig: new SavingConfigMap(),
          savingText: new SavingTextMap(),
          savingProjectStudio: false,
          savingLanguage: [],
          savingImage: {},
          savingTextInfos: false,
          mapsModified: state.mapsModified,
        };
        setGlobalState(globalState);
        buildSelectOptionsTextSourcesFromScratch(globalState);
        buildSelectOptionsFromScratch(globalState);
        addProjectToList({
          projectStudio: state.preState.projectStudio,
          projectPath: state.preState.projectPath,
          lastEdit: new Date(),
        });
        updateProjectStudio(state.preState.projectPath, state.preState.projectStudio);
        if (state.integrityFailureCount) {
          callbacks?.onIntegrityFailure(state.integrityFailureCount);
          setState({ state: 'done' });
        } else {
          setState({ state: 'openProject' });
        }
        break;
      }
      case 'openProject':
        loaderRef.current.setProgress(0, 0, tl('loading_project_opening'));
        callbacks?.onSuccess({});
        setState({ state: 'done' });
    }
  }, [state, callbacks]);

  return (
    payload: { projectDirName?: string },
    onSuccess: ProjectLoadSuccessCallback,
    onFailure: ProjectLoadFailureCallback,
    onIntegrityFailure: ProjectLoadIntegrityFailureCallback
  ) => {
    setCallbacks({ onFailure, onSuccess, onIntegrityFailure });
    setState(payload.projectDirName ? { state: 'readingVersion', projectDirName: payload.projectDirName } : { state: 'choosingProjectFile' });
  };
};
