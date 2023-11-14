import { ProjectData } from '@src/GlobalStateProvider';
import type { DbSymbol } from '@modelEntities/dbSymbol';

export const getSelectedMapDbSymbol = (maps: ProjectData['maps'], mapDbSymbols: DbSymbol[], currentDbSymbol: DbSymbol): DbSymbol => {
  const mapsAvailable = Object.entries(maps)
    .map(([value, mapData]) => ({ dbSymbol: value, index: mapData.id }))
    .filter((mapDb) => !mapDbSymbols.includes(mapDb.dbSymbol as DbSymbol))
    .sort((a, b) => a.index - b.index);
  const currentAvailable = mapsAvailable.find((mapAvailable) => mapAvailable.dbSymbol === currentDbSymbol);
  if (currentAvailable) return currentAvailable.dbSymbol as DbSymbol;

  return (mapsAvailable[0]?.dbSymbol || '__undef__') as DbSymbol;
};
