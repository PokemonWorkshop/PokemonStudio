import { DbSymbol, DB_SYMBOL_VALIDATOR } from '@modelEntities/dbSymbol';
import { ProjectData } from '@src/GlobalStateProvider';

export const wrongDbSymbol = (dbSymbol: string) => {
  return !DB_SYMBOL_VALIDATOR.safeParse(dbSymbol).success;
};

export const checkDbSymbolExist = (data: ProjectData[keyof ProjectData], newDbSymbol: string) => {
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
export const generateDefaultDbSymbol = (name: string): DbSymbol => {
  if (name.length === 0) return name as DbSymbol;

  const nameNormalized = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll(' ', '_')
    .toLowerCase();
  const characterArray = [...nameNormalized];

  while (characterArray.length > 0 && !characterArray[0].match('^[a-z_]')) characterArray.shift();
  characterArray.forEach((c, index) => {
    characterArray[index] = !c.match('^[a-z0-9_]+$') ? '' : c;
  });
  return characterArray.join('') as DbSymbol;
};
