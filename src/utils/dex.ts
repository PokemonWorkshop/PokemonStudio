import { ProjectData } from '@src/GlobalStateProvider';
import DexModel, { DexCreature } from '@modelEntities/dex/Dex.model';
import PokemonForm from '@modelEntities/pokemon/PokemonForm';

export const isResetAvailable = (dex: DexModel, pokemon: ProjectData['pokemon']): boolean => {
  if (dex.dbSymbol !== 'national') return false;

  const sortPokemonDbSymbol = Object.entries(pokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.clone().creatures.sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));
  if (sortPokemonDbSymbol.length !== sortDexCreatures.length) return true;

  return !sortDexCreatures.some((dexCreature, index) => dexCreature.dbSymbol === sortPokemonDbSymbol[index]);
};

export const searchEvolutionPokemon = (creature: DexCreature, allPokemon: ProjectData['pokemon'], currentCreatures: DexCreature[]): DexCreature[] => {
  const pokemonForm = allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
  if (!pokemonForm || pokemonForm.evolutions.length === 0) return [];

  const creatures = pokemonForm.evolutions
    .filter(
      (evolution) => evolution.dbSymbol && currentCreatures.find((currentCreature) => currentCreature.dbSymbol === evolution.dbSymbol) === undefined
    )
    .map((evolution) => ({ dbSymbol: evolution.dbSymbol as string, form: evolution.form }));
  currentCreatures.push(...creatures);
  creatures.forEach((c) => creatures.push(...searchEvolutionPokemon(c, allPokemon, currentCreatures)));
  return creatures;
};

export const searchUnderAndEvolutions = (pokemonForm: PokemonForm, creature: DexCreature, allPokemon: ProjectData['pokemon']): DexCreature[] => {
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
