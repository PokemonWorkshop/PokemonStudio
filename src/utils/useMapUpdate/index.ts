import type { MapUpdateFailureCallback, MapUpdateSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@utils/useProcess';
import { useMapUpdateProcessor } from './useMapUpdateProcessor';

export const useMapUpdate = () => {
  const { processors, binding } = useMapUpdateProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (onSuccess: MapUpdateSuccessCallback, onFailure: MapUpdateFailureCallback) => {
    binding.current = { onFailure, onSuccess };
    setState({ state: 'convert' });
  };
};
