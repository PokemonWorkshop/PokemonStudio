import { z } from 'zod';
import { DB_SYMBOL_VALIDATOR, DbSymbol } from '../dbSymbol';
import { battleRunning, wildEncounterAvailable } from './battleConditions';
import { bestiaryCompleted, caughtCreatureCount, creatureCaught, creatureSeen, seenCreatureCount } from './bestiaryConditions';
import { followMeActive, followMeLetsGoActive, followersCount } from './characterConditions';
import { PCFull, creatureInPC, creatureInParty, partyFull, partySize } from './creaturePartyConditions';
import { creatureInDayCare, creatureInDayCareCount, eggAvailable } from './dayCareConditions';
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
import { keyHoldDuration, repeatedInput } from './inputConditions';
import { itemCategoryOwned, itemOwned, itemQuantity, repelActive } from './inventoryConditions';
import { CONDITION_OPERATOR_GROUPS, CONDITION_OPERATOR_LIST } from './operators';
import { playTime, playerMoney, playerName, playerState, stepCount } from './playerConditions';
import { badgeCount, badgeOwned, bestiaryObtained, bestiaryVariantActive, starterChosen } from './progressionConditions';
import { questStatus, questType, rewardsClaimed } from './questConditions';
import { timeOfDay, timer, weather } from './timeEnvironmentConditions';
import { CONDITION_VALUE_TYPE_VALIDATOR } from './values';
import {
  booleanEventVariable,
  booleanVariable,
  numberEventVariable,
  numberVariable,
  stringEventVariable,
  stringVariable,
} from './variableConditions';

export const CONDITION_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  operators: z.array(z.enum(CONDITION_OPERATOR_LIST)),
  subjectTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR).optional(),
  valueTypes: z.array(CONDITION_VALUE_TYPE_VALIDATOR),
});
export type StudioCondition = z.infer<typeof CONDITION_VALIDATOR>;

export type ConditionForCategory = {
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

export const CONDITIONS_FROM_CATEGORY: Record<StudioConditionCategory, ConditionForCategory[]> = {
  variable: [
    { condition: booleanVariable, minimumVersion: '3.0.0' },
    { condition: booleanEventVariable, minimumVersion: '3.0.0' },
    { condition: numberVariable, minimumVersion: '3.0.0' },
    { condition: numberEventVariable, minimumVersion: '3.0.0' },
    { condition: stringVariable, minimumVersion: '3.0.0' },
    { condition: stringEventVariable, minimumVersion: '3.0.0' },
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
    { condition: playerName, minimumVersion: '3.2.0' },
  ],
  inventory: [
    { condition: itemOwned, minimumVersion: '3.0.0' },
    { condition: itemCategoryOwned, minimumVersion: '3.0.0' },
    { condition: itemQuantity, minimumVersion: '3.0.0' },
    { condition: repelActive, minimumVersion: '3.2.0' },
  ],
  progression: [
    { condition: badgeOwned, minimumVersion: '3.0.0' },
    { condition: badgeCount, minimumVersion: '3.0.0' },
    { condition: bestiaryObtained, minimumVersion: '3.0.0' },
    { condition: bestiaryVariantActive, minimumVersion: '3.0.0' },
    { condition: starterChosen, minimumVersion: '3.2.0' },
  ],
  time_environment: [
    { condition: timer, minimumVersion: '3.0.0' },
    { condition: weather, minimumVersion: '3.0.0' },
    { condition: timeOfDay, minimumVersion: '3.1.0' },
  ],
  input: [
    { condition: keyHoldDuration, minimumVersion: '3.1.0' },
    { condition: repeatedInput, minimumVersion: '3.1.0' },
  ],
  creature_party: [
    { condition: partySize, minimumVersion: '3.1.0' },
    { condition: partyFull, minimumVersion: '3.2.0' },
    { condition: creatureInParty, minimumVersion: '3.1.0' },
    { condition: creatureInPC, minimumVersion: '3.1.0' },
    { condition: PCFull, minimumVersion: '3.2.0' },
  ],
  bestiary: [
    { condition: seenCreatureCount, minimumVersion: '3.1.0' },
    { condition: caughtCreatureCount, minimumVersion: '3.1.0' },
    { condition: creatureSeen, minimumVersion: '3.1.0' },
    { condition: creatureCaught, minimumVersion: '3.1.0' },
    { condition: bestiaryCompleted, minimumVersion: '3.1.0' },
  ],
  quests: [
    { condition: questStatus, minimumVersion: '3.1.0' },
    { condition: questType, minimumVersion: '3.1.0' },
    { condition: rewardsClaimed, minimumVersion: '3.1.0' },
  ],
  characters: [
    { condition: followersCount, minimumVersion: '3.1.0' },
    { condition: followMeActive, minimumVersion: '3.1.0' },
    { condition: followMeLetsGoActive, minimumVersion: '3.1.0' },
  ],
  daycare: [
    { condition: eggAvailable, minimumVersion: '3.1.0' },
    { condition: creatureInDayCare, minimumVersion: '3.1.0' },
    { condition: creatureInDayCareCount, minimumVersion: '3.1.0' },
  ],
  battle: [
    { condition: battleRunning, minimumVersion: '3.2.0' },
    { condition: wildEncounterAvailable, minimumVersion: '3.2.0' },
  ],
  script: [{ condition: scriptCondition, minimumVersion: '3.0.0' }],
};
