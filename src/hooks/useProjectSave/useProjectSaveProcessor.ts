import { useMemo, useRef } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { updateProjectEditDate, updateProjectStudio as updateProjectStudioLocalStorage } from '@utils/projectList';
import { SavingConfigMap, SavingMap, SavingTextMap } from '@utils/SavingUtils';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useLoaderRef } from '@utils/loaderContext';
import { useTranslation } from 'react-i18next';
import { ProjectSaveFunctionBinding, ProjectSaveStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { handleFailure, isMapsToSaveFunc } from './helpers';
import { toAsyncProcess } from '@hooks/Helper';

const DEFAULT_BINDING: ProjectSaveFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

const STEPS_TOTAL = 9;

export const useProjectSaveProcessor = () => {
  const [globalState, setGlobalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { t: tl } = useTranslation('loader');
  const mapOptions = useSelectOptions('maps');
  const isMapsToSave = useMemo(
    () => isMapsToSaveFunc(globalState),
    [globalState.savingData.map, globalState.savingMapInfo, globalState.savingText.map]
  );
  const isDataToSave =
    globalState.savingData.map.size > 0 ||
    globalState.savingConfig.map.size > 0 ||
    globalState.savingText.map.size > 0 ||
    globalState.savingProjectStudio ||
    globalState.savingTextInfos ||
    globalState.savingMapInfo;

  const binding = useRef<ProjectSaveFunctionBinding>(DEFAULT_BINDING);
  const processors: SpecialStateProcessors<ProjectSaveStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      saveData: (state, setState) => {
        loaderRef.current.open('saving_project', 1, STEPS_TOTAL, tl('saving_project_data'));
        if (globalState.savingData.map.size === 0) return toAsyncProcess(() => setState({ ...state, state: 'saveConfigs' }));

        return window.api.saveProjectData(
          { path: state.projectPath, data: globalState.savingData.getSavingData(globalState.projectData) },
          () => setState({ ...state, state: 'saveConfigs' }),
          handleFailure(setState, binding)
        );
      },
      saveConfigs: (state, setState) => {
        loaderRef.current.setProgress(2, STEPS_TOTAL, tl('saving_project_config'));
        if (globalState.savingConfig.map.size === 0) return toAsyncProcess(() => setState({ ...state, state: 'saveTexts' }));

        return window.api.saveProjectConfigs(
          { path: state.projectPath, configs: globalState.savingConfig.getSavingConfig(globalState.projectConfig) },
          () => setState({ ...state, state: 'saveTexts' }),
          handleFailure(setState, binding)
        );
      },
      saveTexts: (state, setState) => {
        loaderRef.current.setProgress(3, STEPS_TOTAL, tl('saving_project_texts'));
        if (globalState.savingText.map.size === 0) return toAsyncProcess(() => setState({ ...state, state: 'saveTextInfo' }));

        return window.api.saveProjectTexts(
          { path: state.projectPath, texts: globalState.savingText.getSavingText(globalState.projectText) },
          () => setState({ ...state, state: 'saveTextInfo' }),
          handleFailure(setState, binding)
        );
      },
      saveTextInfo: (state, setState) => {
        loaderRef.current.setProgress(4, STEPS_TOTAL, tl('saving_text_info'));
        if (!globalState.savingTextInfos) return toAsyncProcess(() => setState({ ...state, state: 'saveMapInfo' }));

        return window.api.saveTextInfos(
          { projectPath: state.projectPath, textInfos: JSON.stringify(globalState.textInfos, null, 2) },
          () => setState({ ...state, state: 'saveMapInfo' }),
          handleFailure(setState, binding)
        );
      },
      saveMapInfo: (state, setState) => {
        loaderRef.current.setProgress(5, STEPS_TOTAL, tl('saving_map_info'));
        if (!globalState.savingMapInfo) return toAsyncProcess(() => setState({ ...state, state: 'saveRMXPMapInfo' }));

        return window.api.saveMapInfo(
          { projectPath: state.projectPath, mapInfo: JSON.stringify(globalState.mapInfo, null, 2) },
          () => setState({ ...state, state: 'saveRMXPMapInfo' }),
          handleFailure(setState, binding)
        );
      },
      saveRMXPMapInfo: (state, setState) => {
        loaderRef.current.setProgress(6, STEPS_TOTAL, tl('saving_rmxp_map_info'));
        if (!globalState.savingMapInfo || globalState.projectStudio.isTiledMode !== true) {
          return toAsyncProcess(() => setState({ ...state, state: 'updateStudioFile' }));
        }
        return window.api.saveRMXPMapInfo(
          {
            projectPath: state.projectPath,
            mapInfo: JSON.stringify(globalState.mapInfo),
            mapData: JSON.stringify(
              mapOptions.map((option) => ({
                name: option.label,
                dbSymbol: option.value,
                id: globalState.projectData.maps[option.value as DbSymbol].id,
              }))
            ),
          },
          () => setState({ ...state, state: 'updateStudioFile' }),
          handleFailure(setState, binding)
        );
      },
      updateStudioFile: (state, setState) => {
        loaderRef.current.setProgress(7, STEPS_TOTAL, tl('saving_studio_file'));
        if (!globalState.savingProjectStudio) return toAsyncProcess(() => setState({ ...state, state: 'updateProjectList' }));

        return window.api.projectStudioFile(
          { path: state.projectPath, action: 'UPDATE', data: JSON.stringify(globalState.projectStudio, null, 2) },
          () => setState({ ...state, state: 'updateProjectList' }),
          handleFailure(setState, binding)
        );
      },
      updateProjectList: (state, setState) => {
        loaderRef.current.setProgress(8, STEPS_TOTAL, tl('saving_update_project_list'));
        return toAsyncProcess(() => {
          updateProjectEditDate(state.projectPath);
          updateProjectStudioLocalStorage(state.projectPath, globalState.projectStudio);
          // Save the selected identifier in locale storage
          localStorage.setItem(
            `selectedDataIdentifier:${window.api.md5(globalState.projectStudio.title)}`,
            JSON.stringify(globalState.selectedDataIdentifier)
          );
          setState({ state: 'resetSaving' });
        });
      },
      resetSaving: (_, setState) => {
        loaderRef.current.setProgress(9, STEPS_TOTAL, tl('saving_reset'));
        return toAsyncProcess(() => {
          setGlobalState({
            ...globalState,
            savingData: new SavingMap(),
            savingConfig: new SavingConfigMap(),
            savingText: new SavingTextMap(),
            savingProjectStudio: false,
            savingLanguage: [],
            savingTextInfos: false,
            savingMapInfo: false,
            textVersion: 0,
          });
          binding.current.onSuccess({});
          setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalState, globalState.textVersion, globalState.textInfos, globalState.mapInfo, globalState.projectStudio, globalState.mapsModified]
  );

  return { isDataToSave, isMapsToSave, processors, binding, state: globalState };
};
