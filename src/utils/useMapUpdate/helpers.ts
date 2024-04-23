import { MutableRefObject } from 'react';
import type { MapUpdateError, MapUpdateFunctionBinding } from './types';

export const fail = (binding: MutableRefObject<MapUpdateFunctionBinding>, mapUpdateError: MapUpdateError[], genericError?: string) => {
  window.api.log.error(
    'Failed to update the maps',
    mapUpdateError.filter((err) => err.errorMessage)
  );
  if (genericError) window.api.log.error('Failed to update the maps: Generic error: ', genericError);
  binding.current.onFailure(mapUpdateError, genericError);
};

export const toAsyncProcess = (func: () => void) => {
  (async () => {
    func();
  })();
  return () => {};
};
