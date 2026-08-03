import { toAsyncProcess } from '@hooks/Helper';
import { useDefaultTextInfoTranslation } from '@hooks/useDefaultTextInfoTranslation';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { buildSelectOptionsFromScratch, buildSelectOptionsTextSourcesFromScratch } from '@hooks/useSelectOptions';
import { PROJECT_VALIDATOR, PROJECT_VERSION_VALIDATOR, StudioProject } from '@modelEntities/project';
import { useGlobalState } from '@src/GlobalStateProvider';
import i18n from '@src/i18n';
import { SavingConfigMap, SavingMap, SavingTextMap } from '@utils/SavingUtils';
import { generateSelectedIdentifier } from '@utils/generateSelectedIdentifier';
import { useLoaderRef } from '@utils/loaderContext';
import { addProjectToList, updateProjectStudio } from '@utils/projectList';
import { getSetting, getSettings } from '@utils/settings';
import { setActiveOnlineProject } from '@utils/onlineConfig';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { deserializeProjectConfig } from './deserializeProjectConfig';
import { deserializeProjectData } from './deserializeProjectData';
import { fail, handleFailure } from './helpers';
import type { ProjectLoadFunctionBinding, ProjectLoadStateObject } from './types';

const DEFAULT_BINDING: ProjectLoadFunctionBinding = {
  onFailure: () => {},
  onIntegrityFailure: () => {},
  onSuccess: () => {},
  onRmxpMigration: (_onContinue) => {},
};

const STEPS_TOTAL = 15;

export const useProjectLoadProcessor = () => {
  const [, setGlobalState] = useGlobalState();
  const defaultTextInfoTranslation = useDefaultTextInfoTranslation();
  const loaderRef = useLoaderRef();
  const { t } = useTranslation();
  const binding = useRef<ProjectLoadFunctionBinding>(DEFAULT_BINDING);
  const processors: SpecialStateProcessors<ProjectLoadStateObject> = useMemo(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    () => ({
      ...PROCESS_DONE_STATE,
      choosingProjectFile: (_, setState) => {
        loaderRef.current.open('loading_project', 0, 0, t('importing_project_choose_project'));
        return window.api.chooseProjectFileToOpen(
          { fileType: 'studio' },
          ({ dirName }) => setState({ state: 'preCheckRmxpMode', projectDirName: dirName }),
          () => {
            setState(DEFAULT_PROCESS_STATE);
            loaderRef.current.close();
          },
        );
      },
      preCheckRmxpMode: (state, setState) => {
        loaderRef.current.open('loading_project', 0, 0, t('loading_project_meta'));
        return window.api.readProjectMetadata(
          { path: state.projectDirName },
          ({ metaData }) => {
            const isRmxpProject = (metaData as StudioProject & { isTiledMode: boolean }).isTiledMode === false;
            if (isRmxpProject) {
              loaderRef.current.close();
              binding.current.onRmxpMigration(() => setState({ state: 'migrateToTiledMode', projectDirName: state.projectDirName }));
            } else {
              setState({ state: 'readingVersion', projectDirName: state.projectDirName });
            }
          },
          handleFailure(setState, binding),
        );
      },
      migrateToTiledMode: (state, setState) => {
        loaderRef.current.open('loading_project', 0, 0, t('loading_project_rmxp_migration'));
        return window.api.readProjectMetadata(
          { path: state.projectDirName },
          ({ metaData }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isTiledMode, ...metaDataWithoutTiledMode } = metaData as StudioProject & { isTiledMode: boolean };
            return window.api.writeProjectMetadata(
              { path: state.projectDirName, metaData: JSON.stringify(metaDataWithoutTiledMode, null, 2) },
              () => setState({ state: 'readingVersion', projectDirName: state.projectDirName }),
              handleFailure(setState, binding),
            );
          },
          handleFailure(setState, binding),
        );
      },
      readingVersion: (state, setState) => {
        loaderRef.current.open('loading_project', 1, STEPS_TOTAL, t('importing_project_reading_version'));
        window.api.clearCache();
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'readProjectMetadata', studioVersion: projectVersion.studioVersion }),
          handleFailure(setState, binding),
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
            } else if (projectVersion.data.studioVersion.localeCompare(state.studioVersion, undefined, { numeric: true }) === 1) {
              handleFailure(setState, binding)({ errorMessage: t('error_project_version') });
            } else {
              setState({ ...state, state: 'migrateProjectData', projectVersion: projectVersion.data.studioVersion });
            }
          },
          handleFailure(setState, binding),
        );
      },
      migrateProjectData: (state, setState) =>
        window.api.migrateData(
          { projectPath: state.projectDirName, projectVersion: state.projectVersion, studioSettings: getSettings() },
          ({ projectStudio }) => {
            setState({ ...state, state: 'writeProjectMetadata', projectMetaData: { ...projectStudio, studioVersion: state.studioVersion } });
          },
          handleFailure(setState, binding),
          (payload) => {
            loaderRef.current.open('migrating_data', payload.step, payload.total, payload.stepText);
          },
        ),
      writeProjectMetadata: (state, setState) => {
        loaderRef.current.open('loading_project', 4, STEPS_TOTAL, t('importing_project_writing_meta'));
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData: JSON.stringify(state.projectMetaData, null, 2) },
          () => setState({ ...state, state: 'updateTextInfos' }),
          handleFailure(setState, binding),
        );
      },
      updateTextInfos: (state, setState) => {
        loaderRef.current.setProgress(5, STEPS_TOTAL, t('loading_update_text_infos'));
        return window.api.updateTextInfos(
          { projectPath: state.projectDirName, currentLanguage: i18n.language, textInfoTranslation: defaultTextInfoTranslation() },
          () => setState({ ...state, state: 'readProjectConfigs' }),
          handleFailure(setState, binding),
        );
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
          handleFailure(setState, binding),
        );
      },
      readProjectData: (state, setState) => {
        loaderRef.current.setProgress(9, STEPS_TOTAL, t('loading_project_data'));
        return window.api.readProjectData(
          { path: state.projectDirName },
          (projectData) => setState({ ...state, state: 'readProjectText', projectData }),
          handleFailure(setState, binding),
        );
      },
      readProjectText: (state, setState) => {
        loaderRef.current.setProgress(10, STEPS_TOTAL, t('loading_project_text'));
        return window.api.readProjectTexts(
          { path: state.projectDirName },
          (projectTexts) => setState({ ...state, state: 'deserializeProjectData', projectTexts }),
          handleFailure(setState, binding),
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
                  eventTree: state.projectData.eventTree,
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
            tiledExecPath: getSetting('tiledPath'),
          },
          ({ dbSymbols }) => setState({ ...state, state: 'readCurrentPSDKVersion', mapsModified: dbSymbols }),
          handleFailure(setState, binding),
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
          loaderRef.current.setProgress(14, STEPS_TOTAL, t('loading_project_identifier'));
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
            savingEventTree: false,
            mapsModified: state.mapsModified,
          };
          setGlobalState(globalState);
          // Point the per-project Online config at this project before any
          // online call can fire (onlineApi reads getOnlineConfig() outside React).
          setActiveOnlineProject(state.preState.projectPath);
          buildSelectOptionsTextSourcesFromScratch(globalState);
          buildSelectOptionsFromScratch(globalState);
          addProjectToList({
            projectStudio: state.preState.projectStudio,
            projectPath: state.preState.projectPath,
            lastEdit: new Date(),
          });
          updateProjectStudio(state.preState.projectPath, state.preState.projectStudio);
          setState({ state: 'openProject', preState: state.preState });
        });
      },
      openProject: (state, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(0, 0, t('loading_project_opening'));
          binding.current.onSuccess({});
          window.dispatchEvent(new CustomEvent('project-opened', { detail: { projectStudio: state.preState.projectStudio } }));
          setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    [],
  );

  return { processors, binding };
};
