import { assertUnreachable } from '@utils/assertUnreachable';
import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DbSymbol, DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const IV_EV_VALIDATOR = z.object({
  hp: z.number().finite(),
  atk: z.number().finite(),
  dfe: z.number().finite(),
  spd: z.number().finite(),
  ats: z.number().finite(),
  dfs: z.number().finite(),
});
export type StudioIvEv = z.infer<typeof IV_EV_VALIDATOR>;

const EXPAND_POKEMON_SETUP_VALIDATOR = z.discriminatedUnion('type', [
  z.object({ type: z.literal('givenName'), value: z.string() }),
  z.object({ type: z.literal('caughtWith'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('gender'), value: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(-1)]) }),
  z.object({ type: z.literal('nature'), value: z.string() }),
  z.object({ type: z.literal('ivs'), value: IV_EV_VALIDATOR }),
  z.object({ type: z.literal('evs'), value: IV_EV_VALIDATOR }),
  z.object({ type: z.literal('itemHeld'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('ability'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('rareness'), value: POSITIVE_OR_ZERO_INT }),
  z.object({ type: z.literal('loyalty'), value: POSITIVE_OR_ZERO_INT }),
  z.object({ type: z.literal('moves'), value: z.array(DB_SYMBOL_VALIDATOR) }),
  z.object({ type: z.literal('originalTrainerName'), value: z.string() }),
  z.object({ type: z.literal('originalTrainerId'), value: z.number().finite() }),
]);
export type StudioExpandPokemonSetup = z.infer<typeof EXPAND_POKEMON_SETUP_VALIDATOR>;

// TODO: Vérifier si ça ne devrait pas plutôt être une union discriminée (rate = -1 si automatic, >= 0 sinon)
export const SHINY_SETUP_VALIDATOR = z.object({
  kind: z.literal('automatic').or(z.literal('rate')),
  rate: z.number(),
});

export const LEVEL_MIN_MAX_VALIDATOR = z.object({
  minimumLevel: POSITIVE_OR_ZERO_INT,
  maximumLevel: POSITIVE_OR_ZERO_INT,
});

export const LEVEL_SETUP_VALIDATOR = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed'), level: POSITIVE_OR_ZERO_INT }),
  z.object({ kind: z.literal('minmax'), level: LEVEL_MIN_MAX_VALIDATOR }),
]);

export const ENCOUNTER_VALIDATOR = z.object({
  specie: DB_SYMBOL_VALIDATOR,
  form: POSITIVE_OR_ZERO_INT.or(z.literal(-1)),
  shinySetup: SHINY_SETUP_VALIDATOR,
  levelSetup: LEVEL_SETUP_VALIDATOR,
  randomEncounterChance: POSITIVE_OR_ZERO_INT,
  expandPokemonSetup: z.array(EXPAND_POKEMON_SETUP_VALIDATOR),
});
export type StudioGroupEncounter = z.infer<typeof ENCOUNTER_VALIDATOR>;

export const createExpandPokemonSetup = (type: StudioExpandPokemonSetup['type']): StudioExpandPokemonSetup => {
  switch (type) {
    case 'givenName':
    case 'originalTrainerName':
      return { type: type, value: '' };
    case 'ability':
      return { type: type, value: '__undef__' as DbSymbol };
    case 'caughtWith':
      return { type: type, value: 'poke_ball' as DbSymbol };
    case 'evs':
    case 'ivs':
      return { type: type, value: { hp: 0, atk: 0, dfe: 0, spd: 0, ats: 0, dfs: 0 } };
    case 'gender':
      return { type: type, value: -1 };
    case 'itemHeld':
      return { type: type, value: '__undef__' as DbSymbol };
    case 'loyalty':
      return { type: type, value: 70 };
    case 'moves':
      return { type: type, value: ['__undef__', '__undef__', '__undef__', '__undef__'] as DbSymbol[] };
    case 'nature':
      return { type: type, value: '__undef__' as DbSymbol };
    case 'originalTrainerId':
      return { type: type, value: 0 };
    case 'rareness':
      return { type: type, value: -1 };
    default:
      assertUnreachable(type);
  }
  return { type: type, value: '' };
};
