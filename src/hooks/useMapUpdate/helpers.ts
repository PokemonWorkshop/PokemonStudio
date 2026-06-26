import { DbSymbol } from '@modelEntities/dbSymbol';
import { ProjectData } from '@src/GlobalStateProvider';
import { RefObject } from 'react';
import type { MapUpdateError, MapUpdateFiles, MapUpdateFunctionBinding, MapUpdateType } from './types';

export const fail = (binding: RefObject<MapUpdateFunctionBinding>, mapUpdateError: MapUpdateError[], genericError?: string) => {
  window.api.log.error(
    'Failed to update the maps',
    mapUpdateError.filter((err) => err.errorMessage),
  );
  if (genericError) window.api.log.error('Failed to update the maps: Generic error: ', genericError);
  binding.current.onFailure(mapUpdateError, genericError);
};

export const getTmxList = (
  maps: ProjectData['maps'],
  mapsModified: DbSymbol[],
  type: MapUpdateType,
  subsetDbSymbols?: DbSymbol[],
): MapUpdateFiles[] => {
  const allMaps = Object.values(maps);
  // Explicit subset (e.g. user clicked the per-map "update this" dot) takes
  // precedence over `type` — the caller already chose exactly which maps to
  // touch and we shouldn't second-guess that.
  if (subsetDbSymbols && subsetDbSymbols.length > 0) {
    const wanted = new Set(subsetDbSymbols);
    return allMaps.filter((map) => wanted.has(map.dbSymbol)).map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));
  }
  if (type === 'full') return allMaps.map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));

  return allMaps.filter((map) => mapsModified.includes(map.dbSymbol)).map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));
};
