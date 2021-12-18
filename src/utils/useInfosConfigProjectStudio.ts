import InfosConfigModel from '@modelEntities/config/InfosConfig.model';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import { useGlobalState } from '@src/GlobalStateProvider';
import { SavingConfigMap } from './SavingUtils';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate infos config and project studio data from a specific screen.
 * @note This Hook **SHOULD NEVER** be used with `useGlobalState()`! **This cause data inconsistency**. If you need anything, this hook returns everything you need, just pass the result to children of your page!
 * @example
 * const {
 *  projectStudioValues: projectStudio,
 *  infosConfigValues: infosConfig,
 *  setValues: setValues,
 * } = useInfosConfigProjectStudio();
 */
export const useInfosConfigProjectStudio = () => {
  const [state, setState] = useGlobalState();
  const projectStudioValues = state.projectStudio;
  const infosConfigValues = state.projectConfig.infos_config;

  const setValues = (newInfosConfigValues: InfosConfigModel, newStudioValues: ProjectStudioModel) => {
    const isInfoConfigModified = JSON.stringify(newInfosConfigValues) !== JSON.stringify(infosConfigValues);
    const isProjectStudioModified = JSON.stringify(newStudioValues) !== JSON.stringify(projectStudioValues);
    if (isInfoConfigModified && isProjectStudioModified) {
      setState({
        ...state,
        projectStudio: newStudioValues,
        projectConfig: { ...state.projectConfig, infos_config: newInfosConfigValues },
        savingConfig: new SavingConfigMap(state.savingConfig.set('infos_config', 'UPDATE')),
        savingProjectStudio: true,
      });
    } else if (isInfoConfigModified) {
      setState({
        ...state,
        projectStudio: newStudioValues,
        projectConfig: { ...state.projectConfig, infos_config: newInfosConfigValues },
        savingConfig: new SavingConfigMap(state.savingConfig.set('infos_config', 'UPDATE')),
      });
    } else if (isProjectStudioModified) {
      setState({
        ...state,
        projectStudio: newStudioValues,
        projectConfig: { ...state.projectConfig, infos_config: newInfosConfigValues },
        savingProjectStudio: true,
      });
    } else {
      setState({
        ...state,
        projectStudio: newStudioValues,
        projectConfig: { ...state.projectConfig, infos_config: newInfosConfigValues },
      });
    }
  };

  return {
    projectStudioValues,
    infosConfigValues,
    setValues,
    state,
  };
};

export type UseConfigInfosProjectStudioReturnType = ReturnType<typeof useInfosConfigProjectStudio>;
