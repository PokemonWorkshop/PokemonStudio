import type { ProjectNewFailureCallback, ProjectNewPayload, ProjectNewSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import { useProjectNewProcessor } from './useProjectNewProcessor';

export const useProjectNew = () => {
  const { processors, binding } = useProjectNewProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (payload: ProjectNewPayload, onSuccess: ProjectNewSuccessCallback, onFailure: ProjectNewFailureCallback) => {
    binding.current = { onFailure, onSuccess };
    setState({ state: 'choosingDestinationFolder', payload });
  };
};
