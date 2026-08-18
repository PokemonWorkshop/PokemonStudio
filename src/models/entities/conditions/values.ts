import { z } from 'zod';

const CONDITION_VALUE_TYPE_BASE = z.object({});
export const CONDITION_BOOLEAN_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('boolean'),
});

export const CONDITION_VARIABLE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('variable'),
  variableType: z.enum(['boolean', 'number', 'string']),
});

export const CONDITION_NUMBER_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('number'),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  step: z.number(),
});

export const CONDITION_STRING_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('string'),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  regexp: z.string().optional(),
});

export const CONDITION_ENUM_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('enum'),
  enumValues: z.array(z.string()).min(1).optional(),
  valueList: z.enum(['items', 'itemCategories', 'creatures', 'moves', 'abilities', 'types']).optional(),
});

export const CONDITION_POSITION_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('position'),
});

export const CONDITION_ENTITY_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('entity'),
  entityKind: z.enum(['event', 'map', 'creature', 'item', 'bestiary']),
});

export const CONDITION_VALUE_TYPE_VALIDATOR = z.discriminatedUnion('type', [
  CONDITION_VARIABLE_VALUE_TYPE,
  CONDITION_BOOLEAN_VALUE_TYPE,
  CONDITION_NUMBER_VALUE_TYPE,
  CONDITION_STRING_VALUE_TYPE,
  CONDITION_ENUM_VALUE_TYPE,
  CONDITION_POSITION_VALUE_TYPE,
  CONDITION_ENTITY_VALUE_TYPE,
]);
export type StudioConditionValueType = z.infer<typeof CONDITION_VALUE_TYPE_VALIDATOR>;
