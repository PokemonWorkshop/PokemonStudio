import type { MapCopyFailureCallback, MapCopyGenericFailureCallback, MapCopySuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import { useMapCopyProcessor } from './useMapCopyProcessor';

export const useMapCopy = () => {
  const { processors, binding } = useMapCopyProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { tmxFile: string },
    onSuccess: MapCopySuccessCallback,
    onFailure: MapCopyFailureCallback,
    onGenericFailure: MapCopyGenericFailureCallback
  ) => {
    binding.current = { onFailure, onSuccess, onGenericFailure };
    setState({
      state: 'copy',
      tmxFile: payload.tmxFile,
    });
  };
};
