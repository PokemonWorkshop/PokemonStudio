import { useGlobalState, projectTextSave } from '@src/GlobalStateProvider';
import IpcService from '@services/IPC/ipc.service';
import { updateProjectStudio } from '@utils/IPCUtils';
import { updateProjectEditDate } from '@utils/projectList';
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

  const isDataToSave = state.savingData.map.size > 0 || state.savingConfig.map.size > 0 || state.savingProjectStudio || isProjectTextSave;

  const resetSaving = () =>
    setState({ ...state, savingData: new SavingMap(), savingConfig: new SavingConfigMap(), savingProjectStudio: false, tmpHackHasTextToSave: false });

  const saveProject = async () => {
    if (isProjectTextSave) {
      await ipc.send('text-saving', {
        projectText: JSON.stringify(state.projectText),
        path: state.projectPath,
        projectTextSave: projectTextSave,
      });
      projectTextSave.fill(false);
    }
    if (state.savingData.map.size > 0) await ipc.send<unknown>('project-saving', getSavingData());
    if (state.savingConfig.map.size > 0) await ipc.send<unknown>('psdk-configs-saving', getSavingConfig());
    if (state.savingProjectStudio) await updateProjectStudio(ipc, state.projectPath, state.projectStudio);
    updateProjectEditDate(state.projectPath || '');
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
