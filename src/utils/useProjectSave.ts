import { useEffect, useState } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { updateProjectEditDate, updateProjectStudio as updateProjectStudioLocalStorage } from './projectList';
import { SavingConfigMap, SavingMap, SavingTextMap } from './SavingUtils';

type ProjectSaveStateObject = {
  state:
    | 'done'
    | 'save_data'
    | 'save_configs'
    | 'save_texts'
    | 'save_text_infos'
    | 'save_images'
    | 'update_studio_file'
    | 'update_project_list'
    | 'reset_saving';
};

type ProjectSaveFailureCallback = (error: { errorMessage: string }) => void;
type ProjectSaveSuccessCallback = () => void;

const fail = (callbacks: { onFailure: ProjectSaveFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useProjectSave = () => {
  const [state, setState] = useGlobalState();
  const [callbacks, setCallbacks] = useState<{ onFailure: ProjectSaveFailureCallback; onSuccess: ProjectSaveSuccessCallback } | undefined>(undefined);
  const [stateSave, setStateSave] = useState<ProjectSaveStateObject>({ state: 'done' });

  const isDataToSave =
    state.savingData.map.size > 0 ||
    state.savingConfig.map.size > 0 ||
    state.savingText.map.size > 0 ||
    state.savingProjectStudio ||
    state.savingTextInfos ||
    Object.keys(state.savingImage).length > 0;

  useEffect(() => {
    switch (stateSave.state) {
      case 'done':
        window.api.cleanupSaveProjectData();
        window.api.cleanupSaveProjectConfigs();
        window.api.cleanupSaveProjectTexts();
        window.api.cleanupSaveTextInfos();
        window.api.cleanupMoveImage();
        window.api.cleanupProjectStudioFile();
        return;
      case 'save_data':
        if (state.savingData.map.size === 0) return setStateSave({ state: 'save_configs' });
        return window.api.saveProjectData(
          { path: state.projectPath!, data: state.savingData.getSavingData(state.projectData) },
          () => setStateSave({ state: 'save_configs' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'save_configs':
        if (state.savingConfig.map.size === 0) return setStateSave({ state: 'save_texts' });
        return window.api.saveProjectConfigs(
          { path: state.projectPath!, configs: state.savingConfig.getSavingConfig(state.projectConfig) },
          () => setStateSave({ state: 'save_texts' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'save_texts': {
        if (state.savingText.map.size === 0) return setStateSave({ state: 'save_text_infos' });
        return window.api.saveProjectTexts(
          { path: state.projectPath!, texts: state.savingText.getSavingText(state.projectText) },
          () => setStateSave({ state: 'save_text_infos' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      }
      case 'save_text_infos':
        if (!state.savingTextInfos) return setStateSave({ state: 'save_images' });
        return window.api.saveTextInfos(
          { projectPath: state.projectPath!, textInfos: JSON.stringify(state.textInfos, null, 2) },
          () => setStateSave({ state: 'save_images' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'save_images':
        if (Object.keys(state.savingImage).length === 0) return setStateSave({ state: 'update_studio_file' });
        return window.api.moveImage(
          { path: state.projectPath!, images: { ...state.savingImage } },
          () => setStateSave({ state: 'update_studio_file' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'update_studio_file':
        if (!state.savingProjectStudio) return setStateSave({ state: 'update_project_list' });
        return window.api.projectStudioFile(
          { path: state.projectPath!, action: 'UPDATE', data: JSON.stringify(state.projectStudio, null, 2) },
          () => setStateSave({ state: 'update_project_list' }),
          ({ errorMessage }) => {
            setStateSave({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'update_project_list':
        updateProjectEditDate(state.projectPath || '');
        updateProjectStudioLocalStorage(state.projectPath || '', state.projectStudio);
        // Save the selected identifier in locale storage
        localStorage.setItem(`selectedDataIdentifier:${window.api.md5(state.projectStudio.title)}`, JSON.stringify(state.selectedDataIdentifier));
        return setStateSave({ state: 'reset_saving' });
      case 'reset_saving':
        setState({
          ...state,
          savingData: new SavingMap(),
          savingConfig: new SavingConfigMap(),
          savingText: new SavingTextMap(),
          savingProjectStudio: false,
          savingLanguage: [],
          savingImage: {},
          savingTextInfos: false,
          textVersion: 0,
        });
        setStateSave({ state: 'done' });
        callbacks?.onSuccess();
        return;
    }
  }, [stateSave, state.textVersion, state, callbacks]);

  return {
    isDataToSave,
    save: (onSuccess: ProjectSaveSuccessCallback, onFailure: ProjectSaveFailureCallback) => {
      setCallbacks({ onFailure, onSuccess });
      setStateSave({ state: 'save_data' });
    },
  };
};
