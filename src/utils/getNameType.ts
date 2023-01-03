import { ProjectData, State } from '@src/GlobalStateProvider';
import { getEntityNameTextUsingTextId } from './ReadingProjectText';

/**
 * Get the name of the type.
 * @param types The data containing the types
 * @param dbSymbol The db_symbol of the type
 * @returns The name of the type. If doesn't exist, return ???
 */
export const getNameType = (types: ProjectData['types'], dbSymbol: string, state: State) => {
  return types[dbSymbol] ? getEntityNameTextUsingTextId(types[dbSymbol], state) : '???';
};
