import { z } from 'zod';
import { DB_SYMBOL_VALIDATOR, DbSymbol } from '../dbSymbol';
import {
  currentMap,
  eventDirection,
  eventPosition,
  playerDirection,
  playerPosition,
  playerSystemTag,
  playerTerrainTag,
  zoneType,
} from './eventMapPositionConditions';
import { itemCategoryOwned, itemOwned, itemQuantity, repelActive } from './inventoryConditions';
import { CONDITION_OPERATOR_GROUPS, CONDITION_OPERATOR_LIST } from './operators';
import { playTime, playerMoney, playerName, playerState, stepCount } from './playerConditions';
import { CONDITION_VALUE_TYPE_VALIDATOR } from './values';
import { booleanVariable, numberVariable, stringVariable } from './variableConditions';

export const CONDITION_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  operators: z.array(z.enum(CONDITION_OPERATOR_LIST)),
  subjectTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR).optional(),
  valueTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR),
});
export type StudioCondition = z.infer<typeof CONDITION_VALIDATOR>;

export type EventConditionForCategory = {
  condition: StudioCondition;
  minimumVersion?: string;
  helper?: boolean;
};

const scriptCondition: StudioCondition = {
  dbSymbol: 'script_condition' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const STUDIO_CONDITION_CATEGORY_LIST = [
  'variable',
  'event_map_position',
  'player',
  'inventory',
  'progression',
  'time_environment',
  'input',
  'creature_party',
  'bestiary',
  'quests',
  'characters',
  'daycare',
  'battle',
  'script',
] as const;
export type StudioConditionCategory = (typeof STUDIO_CONDITION_CATEGORY_LIST)[number];

export const CONDITIONS_FROM_CATEGORY: Record<StudioConditionCategory, EventConditionForCategory[]> = {
  variable: [
    { condition: booleanVariable, minimumVersion: '3.0.0' },
    { condition: numberVariable, minimumVersion: '3.0.0' },
    { condition: stringVariable, minimumVersion: '3.0.0' },
  ],
  event_map_position: [
    { condition: playerDirection, minimumVersion: '3.0.0' },
    { condition: eventDirection, minimumVersion: '3.0.0' },
    { condition: playerPosition, minimumVersion: '3.1.0' },
    { condition: eventPosition, minimumVersion: '3.1.0' },
    { condition: currentMap, minimumVersion: '3.0.0' },
    { condition: playerTerrainTag, minimumVersion: '3.0.0' },
    { condition: playerSystemTag, minimumVersion: '3.0.0' },
    { condition: zoneType, minimumVersion: '3.1.0' },
  ],
  player: [
    { condition: playerMoney, minimumVersion: '3.0.0' },
    { condition: stepCount, minimumVersion: '3.1.0' },
    { condition: playTime, minimumVersion: '3.1.0' },
    { condition: playerState, minimumVersion: '3.1.0' },
    { condition: playerName, minimumVersion: '3.1.0' },
  ],
  inventory: [
    { condition: itemOwned, minimumVersion: '3.0.0' },
    { condition: itemCategoryOwned, minimumVersion: '3.1.0' },
    { condition: itemQuantity, minimumVersion: '3.0.0' },
    { condition: repelActive, minimumVersion: '3.1.0' },
  ],
  progression: [],
  time_environment: [],
  input: [],
  creature_party: [],
  bestiary: [],
  quests: [],
  characters: [],
  daycare: [],
  battle: [],
  script: [{ condition: scriptCondition, minimumVersion: '3.0.0' }],
};
