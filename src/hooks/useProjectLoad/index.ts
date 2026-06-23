import type {
  ProjectLoadFailureCallback,
  ProjectLoadIntegrityFailureCallback,
  ProjectLoadRmxpMigrationCallback,
  ProjectLoadSuccessCallback,
} from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import { useProjectLoadProcessor } from './useProjectLoadProcessor';

export const useProjectLoad = () => {
  const { processors, binding } = useProjectLoadProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { projectDirName?: string },
    onSuccess: ProjectLoadSuccessCallback,
    onFailure: ProjectLoadFailureCallback,
    onIntegrityFailure: ProjectLoadIntegrityFailureCallback,
    onRmxpMigration: ProjectLoadRmxpMigrationCallback,
  ) => {
    binding.current = { onFailure, onIntegrityFailure, onSuccess, onRmxpMigration };
    setState(payload.projectDirName ? { state: 'preCheckRmxpMode', projectDirName: payload.projectDirName } : { state: 'choosingProjectFile' });
  };
};
