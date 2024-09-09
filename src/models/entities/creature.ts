import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT, POSITIVE_INT, POSITIVE_OR_ZERO_FLOAT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const ITEM_HELD_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  chance: POSITIVE_OR_ZERO_INT.max(100).step(1),
});
export type StudioItemHeld = z.infer<typeof ITEM_HELD_VALIDATOR>;

export const TUTOR_LEARNABLE_MOVE_VALIDATOR = z.object({
  klass: z.literal('TutorLearnableMove'),
  move: DB_SYMBOL_VALIDATOR,
});
export type StudioTutorLearnableMove = z.infer<typeof TUTOR_LEARNABLE_MOVE_VALIDATOR>;

export const LEVEL_LEARNABLE_MOVE_VALIDATOR = TUTOR_LEARNABLE_MOVE_VALIDATOR.extend({
  klass: z.literal('LevelLearnableMove'),
  level: POSITIVE_OR_ZERO_INT,
});
export type StudioLevelLearnableMove = z.infer<typeof LEVEL_LEARNABLE_MOVE_VALIDATOR>;

export const TECH_LEARNABLE_MOVE_VALIDATOR = TUTOR_LEARNABLE_MOVE_VALIDATOR.extend({
  klass: z.literal('TechLearnableMove'),
});
export type StudioTechLearnableMove = z.infer<typeof TECH_LEARNABLE_MOVE_VALIDATOR>;

export const BREED_LEARNABLE_MOVE = TUTOR_LEARNABLE_MOVE_VALIDATOR.extend({
  klass: z.literal('BreedLearnableMove'),
});
export type StudioBreedLearnableMove = z.infer<typeof BREED_LEARNABLE_MOVE>;

export const EVOLUTION_LEARNABLE_MOVE = TUTOR_LEARNABLE_MOVE_VALIDATOR.extend({
  klass: z.literal('EvolutionLearnableMove'),
});
export type StudioEvolutionLearnableMove = z.infer<typeof EVOLUTION_LEARNABLE_MOVE>;

export const LEARNABLE_MOVE_VALIDATOR = z.discriminatedUnion('klass', [
  TUTOR_LEARNABLE_MOVE_VALIDATOR,
  LEVEL_LEARNABLE_MOVE_VALIDATOR,
  TECH_LEARNABLE_MOVE_VALIDATOR,
  BREED_LEARNABLE_MOVE,
  EVOLUTION_LEARNABLE_MOVE,
]);
export type StudioLearnableMove = z.infer<typeof LEARNABLE_MOVE_VALIDATOR>;

export const EVOLUTION_CONDITION_VALIDATOR = z.discriminatedUnion('type', [
  z.object({ type: z.literal('minLevel'), value: POSITIVE_INT }),
  z.object({ type: z.literal('maxLevel'), value: POSITIVE_INT }),
  z.object({ type: z.literal('tradeWith'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('trade'), value: z.boolean() }),
  z.object({ type: z.literal('stone'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('itemHold'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('minLoyalty'), value: POSITIVE_INT }),
  z.object({ type: z.literal('maxLoyalty'), value: POSITIVE_INT }),
  z.object({ type: z.literal('skill1'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('skill2'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('skill3'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('skill4'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('weather'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('env'), value: POSITIVE_OR_ZERO_INT }),
  z.object({ type: z.literal('gender'), value: z.union([z.literal(0), z.literal(1), z.literal(2)]) }),
  z.object({ type: z.literal('dayNight'), value: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]) }),
  z.object({ type: z.literal('func'), value: z.string() }),
  z.object({ type: z.literal('maps'), value: z.array(z.number().finite()) }),
  z.object({ type: z.literal('gemme'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('none'), value: z.undefined() }),
]);
export type StudioEvolutionCondition = z.infer<typeof EVOLUTION_CONDITION_VALIDATOR>;
export type StudioEvolutionConditionKey = StudioEvolutionCondition['type'];

export const EVOLUTION_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR.optional(),
  form: POSITIVE_OR_ZERO_INT,
  conditions: z.array(EVOLUTION_CONDITION_VALIDATOR) /*.nonempty()*/,
});
export type StudioEvolution = z.infer<typeof EVOLUTION_VALIDATOR>;

export const CREATURE_RESOURCES_VALIDATOR = z.object({
  icon: z.string(),
  iconF: z.string().optional(),
  iconShiny: z.string(),
  iconShinyF: z.string().optional(),
  front: z.string(),
  frontF: z.string().optional(),
  frontShiny: z.string(),
  frontShinyF: z.string().optional(),
  back: z.string(),
  backF: z.string().optional(),
  backShiny: z.string(),
  backShinyF: z.string().optional(),
  footprint: z.string(),
  character: z.string(),
  characterF: z.string().optional(),
  characterShiny: z.string(),
  characterShinyF: z.string().optional(),
  cry: z.string(),
  hasFemale: z.boolean(),
});
export type StudioCreatureResources = z.infer<typeof CREATURE_RESOURCES_VALIDATOR>;

export const CREATURE_FORM_VALIDATOR = z.object({
  form: POSITIVE_OR_ZERO_INT,
  formTextId: z.object({
    name: POSITIVE_OR_ZERO_INT,
    description: POSITIVE_OR_ZERO_INT,
  }),
  height: POSITIVE_OR_ZERO_FLOAT.min(0.01).max(999.99).step(0.01),
  weight: POSITIVE_OR_ZERO_FLOAT.min(0.01).max(9999.99).step(0.01),
  type1: DB_SYMBOL_VALIDATOR,
  type2: DB_SYMBOL_VALIDATOR,
  baseHp: POSITIVE_INT.max(255),
  baseAtk: POSITIVE_INT.max(255),
  baseDfe: POSITIVE_INT.max(255),
  baseSpd: POSITIVE_INT.max(255),
  baseAts: POSITIVE_INT.max(255),
  baseDfs: POSITIVE_INT.max(255),
  evHp: POSITIVE_OR_ZERO_INT.max(255),
  evAtk: POSITIVE_OR_ZERO_INT.max(255),
  evDfe: POSITIVE_OR_ZERO_INT.max(255),
  evSpd: POSITIVE_OR_ZERO_INT.max(255),
  evAts: POSITIVE_OR_ZERO_INT.max(255),
  evDfs: POSITIVE_OR_ZERO_INT.max(255),
  evolutions: z.array(EVOLUTION_VALIDATOR),
  experienceType: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  baseExperience: POSITIVE_OR_ZERO_INT.max(1000),
  baseLoyalty: POSITIVE_OR_ZERO_INT.max(255),
  catchRate: POSITIVE_OR_ZERO_INT.max(255),
  femaleRate: z.union([POSITIVE_OR_ZERO_FLOAT.step(0.01).max(100), z.literal(-1)]),
  breedGroups: z.array(POSITIVE_OR_ZERO_INT),
  hatchSteps: POSITIVE_INT.max(99999),
  babyDbSymbol: DB_SYMBOL_VALIDATOR,
  babyForm: POSITIVE_OR_ZERO_INT,
  itemHeld: z.array(ITEM_HELD_VALIDATOR),
  abilities: z.array(DB_SYMBOL_VALIDATOR).min(3).max(3),
  frontOffsetY: z.number().min(-999).max(999),
  resources: CREATURE_RESOURCES_VALIDATOR,
  moveSet: z.array(LEARNABLE_MOVE_VALIDATOR),
});
export type StudioCreatureForm = z.infer<typeof CREATURE_FORM_VALIDATOR>;

export const CREATURE_VALIDATOR = z.object({
  klass: z.literal('Specie'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  forms: z.array(CREATURE_FORM_VALIDATOR).nonempty(),
});
export type StudioCreature = z.infer<typeof CREATURE_VALIDATOR>;

export const CREATURE_DESCRIPTION_TEXT_ID = 100002;
export const CREATURE_NAME_TEXT_ID = 100000;
export const CREATURE_SPECIE_TEXT_ID = 100001;
export const CREATURE_FORM_NAME_TEXT_ID = 100067;
export const CREATURE_FORM_DESCRIPTION_TEXT_ID = 100068;
