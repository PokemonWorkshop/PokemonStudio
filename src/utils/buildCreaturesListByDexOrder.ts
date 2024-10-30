import { State } from '@src/GlobalStateProvider';
import { cloneEntity } from './cloneEntity';

export const buildCreaturesListByDexOrder = (state: State) => {
  const allPokemon = state.projectData.pokemon;
  const nationalDex = state.projectData.dex['national'];
  if (!nationalDex) {
    return Object.values(allPokemon).sort((a, b) => a.id - b.id);
  }

  const creaturesFromDex = cloneEntity(nationalDex.creatures)
    .filter(({ dbSymbol }) => allPokemon[dbSymbol] !== undefined)
    .map((creature) => ({ dbSymbol: creature.dbSymbol, id: allPokemon[creature.dbSymbol].id }));
  return Object.values(allPokemon)
    .sort((a, b) => a.id - b.id)
    .reduce((prev, creature) => {
      // If the creature doesn't exist in the national dex, it is added at the end of the list
      if (prev.find(({ dbSymbol }) => dbSymbol === creature.dbSymbol)) return prev;

      return [...prev, { dbSymbol: creature.dbSymbol, id: allPokemon[creature.dbSymbol].id }];
    }, creaturesFromDex);
};
