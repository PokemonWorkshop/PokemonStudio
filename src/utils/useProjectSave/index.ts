import type { ProjectSaveFailureCallback, ProjectSaveSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@utils/useProcess';
import { useProjectSaveProcessor } from './useProjectSaveProcessor';

export const useProjectSave = () => {
  const { processors, binding, isDataToSave, state } = useProjectSaveProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return {
    isDataToSave,
    save: (onSuccess: ProjectSaveSuccessCallback, onFailure: ProjectSaveFailureCallback) => {
      binding.current = { onFailure, onSuccess };
      setState({ state: 'saveData', projectPath: state.projectPath || '' });
    },
  };
};
