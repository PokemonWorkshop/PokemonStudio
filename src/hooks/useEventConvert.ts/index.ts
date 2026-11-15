import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import type { EventConvertFailureCallback, EventConvertSuccessCallback } from './types';
import { useEventConvertProcessor } from './useEventConvertProcessor';

export const useEventConvert = () => {
  const { processors, binding } = useEventConvertProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (payload: { mapId: number; eventIds?: number[] }, onSuccess: EventConvertSuccessCallback, onFailure: EventConvertFailureCallback) => {
    binding.current = { onFailure, onSuccess };
    setState({
      state: 'read',
      mapId: payload.mapId,
      eventIds: payload.eventIds,
    });
  };
};
