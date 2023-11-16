import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { ENCOUNTER_VALIDATOR } from './groupEncounter';

export const CUSTOM_GROUP_CONDITION_TYPE_VALIDATOR = z.literal('enabledSwitch').or(z.literal('mapId'));
export type StudioCustomGroupConditionType = z.infer<typeof CUSTOM_GROUP_CONDITION_TYPE_VALIDATOR>;

export const RELATION_WITH_PREVIOUS_CONDITION_VALIDATOR = z.literal('AND').or(z.literal('OR'));
export type StudioRelationWithPreviousCondition = z.infer<typeof RELATION_WITH_PREVIOUS_CONDITION_VALIDATOR>;

const CUSTOM_GROUP_CONDITION_VALIDATOR = z.object({
  type: CUSTOM_GROUP_CONDITION_TYPE_VALIDATOR,
  value: z.number().finite(),
  relationWithPreviousCondition: RELATION_WITH_PREVIOUS_CONDITION_VALIDATOR,
});
export type StudioCustomGroupCondition = z.infer<typeof CUSTOM_GROUP_CONDITION_VALIDATOR>;

export const GROUP_SYSTEM_TAG_VALIDATOR = z.union([
  z.literal('RegularGround'),
  z.literal('Grass'),
  z.literal('TallGrass'),
  z.literal('Cave'),
  z.literal('Mountain'),
  z.literal('Sand'),
  z.literal('Pond'),
  z.literal('Ocean'),
  z.literal('UnderWater'),
  z.literal('Snow'),
  z.literal('Ice'),
  z.literal('HeadButt'),
]);
export type StudioGroupSystemTag = z.infer<typeof GROUP_SYSTEM_TAG_VALIDATOR>;
export const GROUP_SYSTEM_TAGS: Readonly<StudioGroupSystemTag[]> = [
  'RegularGround',
  'Grass',
  'TallGrass',
  'Cave',
  'Mountain',
  'Sand',
  'Pond',
  'Ocean',
  'UnderWater',
  'Snow',
  'Ice',
  'HeadButt',
] as const;

export const GROUP_TOOL_VALIDATOR = z.union([z.null(), z.literal('OldRod'), z.literal('GoodRod'), z.literal('SuperRod'), z.literal('RockSmash')]);
export type StudioGroupTool = z.infer<typeof GROUP_TOOL_VALIDATOR>;

export const GROUP_VALIDATOR = z.object({
  klass: z.literal('Group'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  systemTag: GROUP_SYSTEM_TAG_VALIDATOR,
  terrainTag: POSITIVE_OR_ZERO_INT,
  tool: GROUP_TOOL_VALIDATOR.default(null),
  isDoubleBattle: z.boolean().default(false),
  isHordeBattle: z.boolean().default(false),
  customConditions: z.array(CUSTOM_GROUP_CONDITION_VALIDATOR),
  encounters: z.array(ENCOUNTER_VALIDATOR),
  stepsAverage: POSITIVE_OR_ZERO_INT,
});
export type StudioGroup = z.infer<typeof GROUP_VALIDATOR>;

export const GROUP_NAME_TEXT_ID = 100061;
