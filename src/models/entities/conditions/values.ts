import { z } from 'zod';
const CONDITION_VALUE_TYPE_BASE = z.object({});
export const CONDITION_BOOLEAN_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('boolean'),
});

export const CONDITION_NUMBER_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('number'),
  minimum: z.number(),
  maximum: z.number(),
  step: z.number(),
});

export const CONDITION_VARIABLE_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('variable'),
});

export const CONDITION_ENUM_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('enum'),
  enumValues: z.array(z.string()).min(1).optional(),
  valueList: z.enum(['items', 'berries', 'creatures', 'moves', 'abilities', 'types']).optional(),
});

export const CONDITION_ENTITY_VALUE_TYPE = CONDITION_VALUE_TYPE_BASE.extend({
  type: z.literal('entity'),
  entityKind: z.enum(['event', 'map', 'creature', 'item']),
});

export const CONDITION_VALUE_TYPE_VALIDATOR = z.discriminatedUnion('type', [
  CONDITION_BOOLEAN_VALUE_TYPE,
  CONDITION_NUMBER_VALUE_TYPE,
  CONDITION_VARIABLE_VALUE_TYPE,
  CONDITION_ENUM_VALUE_TYPE,
  CONDITION_ENTITY_VALUE_TYPE,
]);
export type StudioConditionValueType = z.infer<typeof CONDITION_VALUE_TYPE_VALIDATOR>;
