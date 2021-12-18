import { ProjectData } from '@src/GlobalStateProvider';

/**
 * Get the name of the type.
 * @param types The data containing the types
 * @param dbSymbol The db_symbol of the type
 * @returns The name of the type. If doesn't exist, return ???
 */
export const getNameType = (types: ProjectData['types'], dbSymbol: string) => {
  return types[dbSymbol] ? types[dbSymbol].name() : '???';
};
