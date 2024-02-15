import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ProjectSaveFunctionBinding, ProjectSaveStateObject } from './types';
import { DEFAULT_PROCESS_STATE } from '@utils/useProcess';

export const fail = (binding: MutableRefObject<ProjectSaveFunctionBinding>, error: unknown) => {
  window.api.log.error('Failed to save the project', error);
  binding.current.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const handleFailure =
  (setState: Dispatch<SetStateAction<ProjectSaveStateObject>>, binding: MutableRefObject<ProjectSaveFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string }) => {
    setState(DEFAULT_PROCESS_STATE);
    fail(binding, errorMessage);
  };

export const toAsyncProcess = (func: () => void) => {
  (async () => {
    func();
  })();
  return () => {};
};
