import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import { DbSymbol } from '@modelEntities/dbSymbol';
import type { MapUpdateFailureCallback, MapUpdateSuccessCallback, MapUpdateType } from './types';
import { useMapUpdateProcessor } from './useMapUpdateProcessor';

export const useMapUpdate = () => {
  const { processors, binding } = useMapUpdateProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { type: MapUpdateType; subsetDbSymbols?: DbSymbol[] },
    onSuccess: MapUpdateSuccessCallback,
    onFailure: MapUpdateFailureCallback,
  ) => {
    binding.current = { onFailure, onSuccess };
    setState({ state: 'convert', type: payload.type, subsetDbSymbols: payload.subsetDbSymbols });
  };
};
