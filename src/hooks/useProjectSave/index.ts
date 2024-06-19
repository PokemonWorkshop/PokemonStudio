import type { ProjectSaveFailureCallback, ProjectSaveSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import { useProjectSaveProcessor } from './useProjectSaveProcessor';

export const useProjectSave = () => {
  const { processors, binding, isDataToSave, isMapsToSave, state } = useProjectSaveProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return {
    isDataToSave,
    isMapsToSave,
    save: (onSuccess: ProjectSaveSuccessCallback, onFailure: ProjectSaveFailureCallback) => {
      binding.current = { onFailure, onSuccess };
      setState({ state: 'saveData', projectPath: state.projectPath || '' });
    },
  };
};
