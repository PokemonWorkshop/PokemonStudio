import { MutableRefObject } from 'react';
import type { MapUpdateError, MapUpdateFunctionBinding } from './types';
import log from 'electron-log';

export const fail = (binding: MutableRefObject<MapUpdateFunctionBinding>, mapUpdateError: MapUpdateError[], genericError?: string) => {
  log.error(
    'Failed to update the maps',
    mapUpdateError.filter((err) => err.errorMessage)
  );
  if (genericError) log.error('Failed to update the maps: Generic error: ', genericError);
  binding.current.onFailure(mapUpdateError, genericError);
};

export const toAsyncProcess = (func: () => void) => {
  (async () => {
    func();
  })();
  return () => {};
};
