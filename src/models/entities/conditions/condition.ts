import { z } from 'zod';
import { DB_SYMBOL_VALIDATOR, DbSymbol } from '../dbSymbol';
import { CONDITION_OPERATOR_GROUPS, CONDITION_OPERATOR_LIST } from './operators';
import { CONDITION_VALUE_TYPE_VALIDATOR } from './values';

export const STUDIO_CONDITION_CATEGORY_LIST = ['player'] as const;
export type StudioConditionCategory = (typeof STUDIO_CONDITION_CATEGORY_LIST)[number];

export const CONDITION_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  minimumVersion: z.string(),
  operators: z.array(z.enum(CONDITION_OPERATOR_LIST)).readonly(),
  subjectTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR).optional(),
  valueTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR),
});
export type StudioCondition = z.infer<typeof CONDITION_VALIDATOR>;

export type EventConditionForCategory = {
  condition: StudioCondition;
  minimumVersion?: string;
  helper?: boolean;
};

const playerMoney: StudioCondition = {
  dbSymbol: 'player_money' as DbSymbol,
  minimumVersion: '3.0.0',
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
    {
      type: 'variable',
    },
  ],
};

const playerDirection: StudioCondition = {
  dbSymbol: 'player_direction' as DbSymbol,
  minimumVersion: '3.0.0',
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['up', 'down', 'left', 'right'],
    },
  ],
};

const eventDirection: StudioCondition = {
  dbSymbol: 'event_direction' as DbSymbol,
  minimumVersion: '3.0.0',
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'entity',
      entityKind: 'event',
    },
  ],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['up', 'down', 'left', 'right'],
    },
  ],
};

const itemOwned: StudioCondition = {
  dbSymbol: 'item_owned' as DbSymbol,
  minimumVersion: '3.0.0',
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'enum',
      valueList: 'items',
    },
  ],
};

const itemQuantity: StudioCondition = {
  dbSymbol: 'item_quantity' as DbSymbol,
  minimumVersion: '3.0.0',
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  subjectTypes: [
    {
      type: 'entity',
      entityKind: 'item',
    },
  ],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
    {
      type: 'variable',
    },
  ],
};

export const CONDITIONS_FROM_CATEGORY: Record<StudioConditionCategory, EventConditionForCategory[]> = {
  player: [
    { condition: playerMoney, minimumVersion: '3.0.0' },
    { condition: playerDirection, minimumVersion: '3.0.0' },
    { condition: eventDirection, minimumVersion: '3.0.0' },
    { condition: itemOwned, minimumVersion: '3.0.0' },
    { condition: itemQuantity, minimumVersion: '3.0.0' },
  ],
};
