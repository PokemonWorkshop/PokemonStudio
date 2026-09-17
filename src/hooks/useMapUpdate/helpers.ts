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

export const getTmxList = (maps: ProjectData['maps'], mapsModified: DbSymbol[], type: MapUpdateType): MapUpdateFiles[] => {
  const allMaps = Object.values(maps);
  if (type === 'full') return allMaps.map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));

  return allMaps.filter((map) => mapsModified.includes(map.dbSymbol)).map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));
};
