import type { RMXP2StudioMapsUpdateFailureCallback, RMXP2StudioMapsUpdateSuccessCallback } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@utils/useProcess';
import { useRMXP2StudioMapsUpdateProcessor } from './useRMXP2StudioMapsUpdateProcessor';

export const useRMXP2StudioMapsUpdate = () => {
  const { processors, binding } = useRMXP2StudioMapsUpdateProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (onSuccess: RMXP2StudioMapsUpdateSuccessCallback, onFailure: RMXP2StudioMapsUpdateFailureCallback) => {
    binding.current = { onFailure, onSuccess };
    setState({ state: 'synchronise' });
  };
};
