import { z } from 'zod';

const CONDITION_VALUE_TYPE_BASE = z.object({});

export const CONDITION_VARIABLE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('variable'),
  variableType: z.enum(['boolean', 'number', 'string']),
});

export const CONDITION_EVENT_VARIABLE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('event_variable'),
  variableType: z.enum(['boolean', 'number', 'string']),
});

export const CONDITION_BOOLEAN_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('boolean'),
});

export const CONDITION_NUMBER_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('number'),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  step: z.number(),
});

export const CONDITION_PERCENTAGE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('percentage'),
});

export const CONDITION_TIME_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('time'),
});

export const CONDITION_STRING_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('string'),
});

export const CONDITION_ENUM_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('enum'),
  enumValues: z.array(z.string()).min(1),
});

export const CONDITION_DATABASE_REFERENCE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('database_reference'),
  referenceType: z.enum(['event', 'map', 'bestiary', 'item', 'itemCategory', 'creature', 'move', 'ability', 'type', 'quest']),
});

export const CONDITION_POSITION_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('position'),
});

export const CONDITION_VALUE_TYPE_VALIDATOR = z.discriminatedUnion('type', [
  CONDITION_VARIABLE_VALUE_TYPE,
  CONDITION_EVENT_VARIABLE_VALUE_TYPE,
  CONDITION_BOOLEAN_VALUE_TYPE,
  CONDITION_NUMBER_VALUE_TYPE,
  CONDITION_TIME_VALUE_TYPE,
  CONDITION_STRING_VALUE_TYPE,
  CONDITION_ENUM_VALUE_TYPE,
  CONDITION_DATABASE_REFERENCE_VALUE_TYPE,
  CONDITION_POSITION_VALUE_TYPE,
]);
export type StudioConditionValueType = z.infer<typeof CONDITION_VALUE_TYPE_VALIDATOR>;
