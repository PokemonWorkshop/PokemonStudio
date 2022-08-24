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

/**
 * Generate a correct default dbSymbol with the name
 * @param name The name of the new database entity
 * @returns A correct default dbSymbol
 */
export const generateDefaultDbSymbol = (name: string) => {
  if (name.length === 0) return name;

  const nameNormalized = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(' ', '_')
    .toLowerCase();
  const characterArray = [...nameNormalized];

  while (characterArray.length > 0 && !characterArray[0].match('^[a-z_]')) characterArray.shift();
  characterArray.forEach((c, index) => {
    characterArray[index] = !c.match('^[a-z0-9_]+$') ? '' : c;
  });
  return characterArray.join('');
};
