import { ProjectData } from '@src/GlobalStateProvider';

export const wrongDbSymbol = (dbSymbol: string) => {
  return !dbSymbol.match('^[a-z_][a-z0-9_]+$');
};

type ProjectDataType = ProjectData['moves'] | ProjectData['items'] | ProjectData['pokemon'] | ProjectData['abilities'] | ProjectData['types'];

export const checkDbSymbolExist = (data: ProjectDataType, newDbSymbol: string) => {
  return Object.entries(data)
    .map(([value]) => value)
    .find((dbSymbol) => dbSymbol === newDbSymbol)
    ? true
    : false;
};
