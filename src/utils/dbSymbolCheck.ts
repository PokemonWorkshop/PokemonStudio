import { ProjectData } from '@src/GlobalStateProvider';

export const wrongDbSymbol = (dbSymbol: string) => {
  return !dbSymbol.match('^[a-z_][a-z0-9_]+$');
};

export const checkDbSymbolExist = (data: ProjectData[''], newDbSymbol: string) => {
  return Object.entries(data)
    .map(([value]) => value)
    .find((dbSymbol) => dbSymbol === newDbSymbol)
    ? true
    : false;
};
