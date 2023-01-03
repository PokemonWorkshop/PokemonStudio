import { ProjectData } from '@src/GlobalStateProvider';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCreatureForm } from '@modelEntities/creature';

export const isResetAvailable = (dex: StudioDex, pokemon: ProjectData['pokemon']): boolean => {
  if (dex.dbSymbol !== 'national') return false;

  const sortPokemonDbSymbol = Object.entries(pokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.creatures.slice().sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));
  if (sortPokemonDbSymbol.length !== sortDexCreatures.length) return true;

  return !sortDexCreatures.some((dexCreature, index) => dexCreature.dbSymbol === sortPokemonDbSymbol[index]);
};

type EvolutionWithFixedDBSymbol = {
  dbSymbol: DbSymbol;
  form: number;
  conditions: StudioCreatureForm['evolutions'][number]['conditions'];
};

export const searchEvolutionPokemon = (
  creature: StudioDexCreature,
  allPokemon: ProjectData['pokemon'],
  currentCreatures: StudioDexCreature[]
): StudioDexCreature[] => {
  const pokemonForm = allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
  if (!pokemonForm || pokemonForm.evolutions.length === 0) return [];

  const creatures = pokemonForm.evolutions
    .filter(
      (evolution): evolution is EvolutionWithFixedDBSymbol =>
        evolution.dbSymbol !== undefined && currentCreatures.find((currentCreature) => currentCreature.dbSymbol === evolution.dbSymbol) === undefined
    )
    .map((evolution) => ({ dbSymbol: evolution.dbSymbol, form: evolution.form }));
  currentCreatures.push(...creatures);
  creatures.forEach((c) => creatures.push(...searchEvolutionPokemon(c, allPokemon, currentCreatures)));
  return creatures;
};

export const searchUnderAndEvolutions = (
  pokemonForm: StudioCreatureForm,
  creature: StudioDexCreature,
  allPokemon: ProjectData['pokemon']
): StudioDexCreature[] => {
  const babyDbSymbol = allPokemon[pokemonForm.babyDbSymbol]?.dbSymbol;
  // no baby, search only the evolutions
  if (!babyDbSymbol) {
    const dexCreatures = searchEvolutionPokemon(creature, allPokemon, []);
    dexCreatures.unshift(creature);
    return dexCreatures;
  }

  // search the evolutions from the baby
  const babyDexCreature = { dbSymbol: babyDbSymbol, form: pokemonForm.babyForm };
  const dexCreatures = searchEvolutionPokemon(babyDexCreature, allPokemon, []);
  const numberOfEvolutions = dexCreatures.length;
  dexCreatures.unshift(babyDexCreature);
  // to manage the Pokémon without evolution but with baby and manaphy & co
  if (numberOfEvolutions === 0 && dexCreatures[0].dbSymbol !== creature.dbSymbol) {
    dexCreatures.push(creature);
    return dexCreatures;
  }
  // fix form
  const creatureToFix = dexCreatures.find((dexCreature) => dexCreature.dbSymbol === creature.dbSymbol);
  if (creatureToFix) creatureToFix.form = creature.form;

  return dexCreatures;
};

export const isCreaturesAlreadyInDex = (dexCreatures: StudioDexCreature[], newCreatures: StudioDexCreature[]) => {
  return newCreatures.every((newCreature) => dexCreatures.find((dc) => dc.dbSymbol === newCreature.dbSymbol && dc.form === newCreature.form));
};

export const isCreatureHasNotEvolution = (creatures: StudioDexCreature[], creature: StudioDexCreature) => {
  return creatures.length === 1 && creatures[0].dbSymbol === creature.dbSymbol && creatures[0].form === creature.form;
};
