import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { ProjectNewFunctionBinding, ProjectNewStateObject } from './types';
import { DEFAULT_PROCESS_STATE } from '@hooks/useProcess';

export const fail = (binding: MutableRefObject<ProjectNewFunctionBinding>, error: unknown) => {
  window.api.log.error('Failed to create a new project', error);
  binding.current.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const handleFailure =
  (setState: Dispatch<SetStateAction<ProjectNewStateObject>>, binding: MutableRefObject<ProjectNewFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string }) => {
    setState(DEFAULT_PROCESS_STATE);
    fail(binding, errorMessage);
  };
