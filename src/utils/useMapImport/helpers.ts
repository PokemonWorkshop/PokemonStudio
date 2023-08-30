import { MutableRefObject } from 'react';
import type { MapImportError, MapImportFunctionBinding } from './types';
import log from 'electron-log';

export const fail = (binding: MutableRefObject<MapImportFunctionBinding>, mapImportError: MapImportError[], genericError?: string) => {
  log.error(
    'Failed to import the maps',
    mapImportError.filter((err) => err.errorMessage)
  );
  if (genericError) log.error('Failed to import the maps: Generic error: ', genericError);
  binding.current.onFailure(mapImportError, genericError);
};

export const toAsyncProcess = (func: () => void) => {
  (async () => {
    func();
  })();
  return () => {};
};
