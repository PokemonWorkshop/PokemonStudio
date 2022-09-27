import { useGlobalState, projectTextSave, projectTextKeys } from '@src/GlobalStateProvider';
import IpcService from '@services/IPC/ipc.service';
import { updateProjectStudio } from '@utils/IPCUtils';
import { updateProjectEditDate, updateProjectStudio as updateProjectStudioLocalStorage } from '@utils/projectList';
import { SavingConfigMap, SavingMap } from './SavingUtils';

export const useProjectSaving = () => {
  const ipc = new IpcService();
  const [state, setState] = useGlobalState();

  const getSavingData = () => ({
    path: state.projectPath!,
    data: state.savingData.getSavingData(state.projectData),
  });

  const getSavingConfig = () => ({
    path: state.projectPath!,
    configs: state.savingConfig.getSavingConfig(state.projectConfig),
  });

  const isProjectTextSave = projectTextSave.some((b) => b) || !!state.tmpHackHasTextToSave;

  const isDataToSave =
    state.savingData.map.size > 0 ||
    state.savingConfig.map.size > 0 ||
    state.savingProjectStudio ||
    isProjectTextSave ||
    Object.keys(state.savingImage).length > 0;

  const resetSaving = () =>
    setState({
      ...state,
      savingData: new SavingMap(),
      savingConfig: new SavingConfigMap(),
      savingProjectStudio: false,
      tmpHackHasTextToSave: false,
      savingLanguage: [],
      savingImage: {},
    });

  const saveProject = async () => {
    const newProjectText = Object.assign({}, state.projectText);
    const newProjectTextSave = [...projectTextSave];
    let modified = false;
    state.savingLanguage.forEach((code) => {
      projectTextKeys.forEach((k, saveIndex) => {
        if (newProjectText[k] !== undefined && !newProjectText[k][0].includes(code)) {
          const defaultIndex = newProjectText[k][0].indexOf(state.projectConfig.language_config.defaultLanguage);
          newProjectText[k] = newProjectText[k].map((line, i) => [...line, i == 0 ? code : line[defaultIndex === -1 ? 0 : defaultIndex]]);
          modified = true;
          newProjectTextSave[saveIndex] = true;
        }
      });
    });

    if (isProjectTextSave || modified) {
      if (modified) setState({ ...state, projectText: newProjectText });
      await ipc.send('text-saving', {
        projectText: JSON.stringify(newProjectText),
        path: state.projectPath,
        projectTextSave: newProjectTextSave,
      });
      projectTextSave.fill(false);
    }
    if (state.savingData.map.size > 0) await ipc.send<unknown>('project-saving', getSavingData());
    if (state.savingConfig.map.size > 0) await ipc.send<unknown>('psdk-configs-saving', getSavingConfig());
    if (state.savingProjectStudio) await updateProjectStudio(ipc, state.projectPath, state.projectStudio);
    if (Object.keys(state.savingImage).length > 0)
      await ipc.send<unknown>('move-image', { path: state.projectPath, savingImage: { ...state.savingImage } });
    updateProjectEditDate(state.projectPath || '');
    updateProjectStudioLocalStorage(state.projectPath || '', state.projectStudio);
    resetSaving();
  };

  return {
    getSavingData,
    getSavingConfig,
    resetSaving,
    saveProject,
    isProjectTextSave,
    isDataToSave,
    state,
    setState,
  };
};
