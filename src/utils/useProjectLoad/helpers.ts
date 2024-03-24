import { deserializeZodData, deserializeZodDiscriminatedData } from '@utils/SerializationUtils';
import type { z } from 'zod';
import type { ProjectLoadFunctionBinding, ProjectLoadStateObject } from './types';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { FilenameWithData } from '@src/backendTasks/readProjectData';

export const fail = (binding: MutableRefObject<ProjectLoadFunctionBinding>, error: unknown) => {
  window.api.log.error('Failed to load project', error);
  binding.current.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const handleFailure =
  (setState: Dispatch<SetStateAction<ProjectLoadStateObject>>, binding: MutableRefObject<ProjectLoadFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string }) => {
    setState({ state: 'done' });
    fail(binding, errorMessage);
  };

export const countZodDataIntegrityFailure = <I extends z.ZodRawShape>(
  inputObjects: FilenameWithData[],
  validator: z.ZodObject<I>,
  count: { count: number }
) => {
  const result = deserializeZodData(inputObjects, validator);
  count.count += result.integrityFailureCount.count;
  return result.input;
};

export const countZodDiscriminatedDataIntegrityFailure = <K extends string, Options extends z.ZodDiscriminatedUnionOption<K>[]>(
  inputObjects: FilenameWithData[],
  validator: z.ZodDiscriminatedUnion<K, Options>,
  count: { count: number }
) => {
  const result = deserializeZodDiscriminatedData(inputObjects, validator);
  count.count += result.integrityFailureCount.count;
  return result.input;
};

export const toAsyncProcess = (func: () => void) => {
  (async () => {
    func();
  })();
  return () => {};
};
