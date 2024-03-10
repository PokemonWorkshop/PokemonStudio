import { useGlobalState } from '@src/GlobalStateProvider';
import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectLoadFunctionBinding, ProjectLoadStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { fail, handleFailure, toAsyncProcess } from './helpers';
import { PROJECT_VALIDATOR, PROJECT_VERSION_VALIDATOR } from '@modelEntities/project';
import { useDefaultTextInfoTranslation } from '@utils/useDefaultTextInfoTranslation';
import i18n from '@src/i18n';
import { SavingMap, SavingConfigMap, SavingTextMap } from '@utils/SavingUtils';
import { generateSelectedIdentifier } from '@utils/generateSelectedIdentifier';
import { addProjectToList, updateProjectStudio } from '@utils/projectList';
import { buildSelectOptionsTextSourcesFromScratch, buildSelectOptionsFromScratch } from '@utils/useSelectOptions';
import { deserializeProjectData } from './deserializeProjectData';
import { deserializeProjectConfig } from './deserializeProjectConfig';

const DEFAULT_BINDING: ProjectLoadFunctionBinding = {
  onFailure: () => {},
  onIntegrityFailure: () => {},
  onSuccess: () => {},
};

const STEPS_TOTAL = 15;

export const useProjectLoadProcessor = () => {
  const [, setGlobalState] = useGlobalState();
  const defaultTextInfoTranslation = useDefaultTextInfoTranslation();
  const loaderRef = useLoaderRef();
  const { t } = useTranslation('loader');
  const binding = useRef<ProjectLoadFunctionBinding>(DEFAULT_BINDING);
  const processors: SpecialStateProcessors<ProjectLoadStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      choosingProjectFile: (_, setState) => {
        loaderRef.current.open('loading_project', 0, 0, t('importing_project_choose_project'));
        return window.api.chooseProjectFileToOpen(
          { fileType: 'studio' },
          ({ dirName }) => setState({ state: 'readingVersion', projectDirName: dirName }),
          () => {
            setState(DEFAULT_PROCESS_STATE);
            loaderRef.current.close();
          }
        );
      },
      readingVersion: (state, setState) => {
        loaderRef.current.open('loading_project', 1, STEPS_TOTAL, t('importing_project_reading_version'));
        window.api.clearCache();
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'readProjectMetadata', studioVersion: projectVersion.studioVersion }),
          handleFailure(setState, binding)
        );
      },
      readProjectMetadata: (state, setState) => {
        loaderRef.current.open('loading_project', 2, STEPS_TOTAL, t('loading_project_meta'));
        return window.api.readProjectMetadata(
          { path: state.projectDirName },
          ({ metaData }) => {
            loaderRef.current.setProgress(3, STEPS_TOTAL, t('loading_project_meta_deserialization'));
            const projectVersion = PROJECT_VERSION_VALIDATOR.safeParse(metaData);
            if (!projectVersion.success) {
              return handleFailure(setState, binding)({ errorMessage: t('failed_deserialize') });
            }
            if (projectVersion.data.studioVersion === state.studioVersion) {
              const projectMetaData = PROJECT_VALIDATOR.safeParse(metaData);
              if (!projectMetaData.success) {
                return handleFailure(setState, binding)({ errorMessage: t('failed_deserialize') });
              }
              setState({ ...state, state: 'updateTextInfos', projectMetaData: projectMetaData.data });
            } else if (projectVersion.data.studioVersion.localeCompare(state.studioVersion) === 1) {
              handleFailure(setState, binding)({ errorMessage: t('error_project_version') });
            } else {
              setState({ ...state, state: 'migrateProjectData', projectVersion: projectVersion.data.studioVersion });
            }
          },
          handleFailure(setState, binding)
        );
      },
      migrateProjectData: (state, setState) =>
        window.api.migrateData(
          { projectPath: state.projectDirName, projectVersion: state.projectVersion },
          ({ projectStudio }) => {
            setState({ ...state, state: 'writeProjectMetadata', projectMetaData: { ...projectStudio, studioVersion: state.studioVersion } });
          },
          handleFailure(setState, binding),
          (payload) => {
            loaderRef.current.open('migrating_data', payload.step, payload.total, payload.stepText);
          }
        ),
      writeProjectMetadata: (state, setState) => {
        loaderRef.current.open('loading_project', 4, STEPS_TOTAL, t('importing_project_writing_meta'));
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData: JSON.stringify(state.projectMetaData, null, 2) },
          () => setState({ ...state, state: 'updateTextInfos' }),
          handleFailure(setState, binding)
        );
      },
      updateTextInfos: (state, setState) => {
        loaderRef.current.setProgress(5, STEPS_TOTAL, t('loading_update_text_infos'));
        return window.api.updateTextInfos(
          { projectPath: state.projectDirName, currentLanguage: i18n.language, textInfoTranslation: defaultTextInfoTranslation() },
          () => setState({ ...state, state: 'RMXP2StudioMapsSync' }),
          handleFailure(setState, binding)
        );
      },
      RMXP2StudioMapsSync: (state, setState) => {
        if (state.projectMetaData.isTiledMode === false) {
          loaderRef.current.setProgress(6, STEPS_TOTAL, t('loading_rmxp_to_studio_maps_sync'));
          return window.api.RMXP2StudioMapsSync(
            { projectPath: state.projectDirName },
            () => setState({ ...state, state: 'readProjectConfigs' }),
            handleFailure(setState, binding)
          );
        } else {
          return toAsyncProcess(() => setState({ ...state, state: 'readProjectConfigs' }));
        }
      },
      readProjectConfigs: (state, setState) => {
        loaderRef.current.setProgress(7, STEPS_TOTAL, t('loading_project_config'));
        return window.api.readProjectConfigs(
          { path: state.projectDirName },
          (configs) => {
            loaderRef.current.setProgress(8, STEPS_TOTAL, t('loading_project_config_deserialization'));
            try {
              setState({ ...state, state: 'readProjectData', projectConfigs: deserializeProjectConfig(configs) });
            } catch (error) {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, error);
            }
          },
          handleFailure(setState, binding)
        );
      },
      readProjectData: (state, setState) => {
        loaderRef.current.setProgress(9, STEPS_TOTAL, t('loading_project_data'));
        return window.api.readProjectData(
          { path: state.projectDirName },
          (projectData) => setState({ ...state, state: 'readProjectText', projectData }),
          handleFailure(setState, binding)
        );
      },
      readProjectText: (state, setState) => {
        loaderRef.current.setProgress(10, STEPS_TOTAL, t('loading_project_text'));
        return window.api.readProjectTexts(
          { path: state.projectDirName },
          (projectTexts) => setState({ ...state, state: 'deserializeProjectData', projectTexts }),
          handleFailure(setState, binding)
        );
      },
      deserializeProjectData: (state, setState) => {
        return toAsyncProcess(() => {
          try {
            loaderRef.current.setProgress(11, STEPS_TOTAL, t('loading_project_data_deserialization'));
            const { integrityFailureCount, projectText, projectData } = deserializeProjectData(state);

            if (integrityFailureCount > 0) {
              binding.current.onIntegrityFailure(integrityFailureCount);
              setState(DEFAULT_PROCESS_STATE);
            } else {
              setState({
                ...state,
                state: 'checkMapsModified',
                preState: {
                  projectConfig: state.projectConfigs,
                  projectData,
                  projectPath: state.projectDirName,
                  projectStudio: state.projectMetaData,
                  projectText,
                  textInfos: state.projectData.textInfos,
                  textVersion: 0,
                  mapInfo: state.projectData.mapInfo,
                },
              });
            }
          } catch (error) {
            setState(DEFAULT_PROCESS_STATE);
            fail(binding, error);
          }
        });
      },
      checkMapsModified: (state, setState) => {
        loaderRef.current.setProgress(12, STEPS_TOTAL, t('loading_check_maps_modified'));
        return window.api.checkMapsModified(
          {
            projectPath: state.preState.projectPath,
            maps: Object.values(state.preState.projectData.maps).map((map) => JSON.stringify(map)),
            method: 'sha1',
          },
          ({ dbSymbols }) => setState({ ...state, state: 'readCurrentPSDKVersion', mapsModified: dbSymbols }),
          handleFailure(setState, binding)
        );
      },
      readCurrentPSDKVersion: (state, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(13, STEPS_TOTAL, t('loading_project_psdk_version'));
          // TODO: fix that API to comply with the BackEndTask model
          window.api
            .getPSDKVersion()
            .then((currentPSDKVersion) => {
              setState({ ...state, state: 'checkLastPSDKVersion', currentPSDKVersion });
            })
            .catch((error) => {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, error);
            });
        });
      },
      checkLastPSDKVersion: (state, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(14, STEPS_TOTAL, t('loading_project_last_psdk_version'));
          // TODO: fix that API to comply with the BackEndTask model
          window.api
            .getLastPSDKVersion()
            .then((lastPSDKVersion) => {
              setState({ ...state, state: 'finalizeGlobalState', lastPSDKVersion });
            })
            .catch((error) => {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, error);
            });
        });
      },
      finalizeGlobalState: (state, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(15, STEPS_TOTAL, t('loading_project_identifier'));
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
            savingTextInfos: false,
            savingMapInfo: false,
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
          setState({ state: 'openProject' });
        });
      },
      openProject: (_, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(0, 0, t('loading_project_opening'));
          binding.current.onSuccess({});
          setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    []
  );

  return { processors, binding };
};
