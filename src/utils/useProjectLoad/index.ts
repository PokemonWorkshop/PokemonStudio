import type { ProjectLoadFailureCallback, ProjectLoadIntegrityFailureCallback, ProjectLoadSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@utils/useProcess';
import { useProjectLoadProcessor } from './useProjectLoadProcessor';

export const useProjectLoad = () => {
  const { processors, binding } = useProjectLoadProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { projectDirName?: string },
    onSuccess: ProjectLoadSuccessCallback,
    onFailure: ProjectLoadFailureCallback,
    onIntegrityFailure: ProjectLoadIntegrityFailureCallback
  ) => {
    binding.current = { onFailure, onIntegrityFailure, onSuccess };
    setState(payload.projectDirName ? { state: 'readingVersion', projectDirName: payload.projectDirName } : { state: 'choosingProjectFile' });
  };
};
