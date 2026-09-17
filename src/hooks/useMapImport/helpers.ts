import { RefObject } from 'react';
import type { MapImportError, MapImportFunctionBinding } from './types';

export const fail = (binding: RefObject<MapImportFunctionBinding>, mapImportError: MapImportError[], genericError?: string) => {
  window.api.log.error(
    'Failed to assign the maps',
    mapImportError.filter((err) => err.errorMessage),
  );
  if (genericError) window.api.log.error('Failed to assign the maps: Generic error: ', genericError);
  binding.current.onFailure(mapImportError, genericError);
};
