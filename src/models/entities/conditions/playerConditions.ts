import { DbSymbol } from '../dbSymbol';
import type { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const playerMoney: StudioCondition = {
  dbSymbol: 'player_money' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
  ],
};

export const stepCount: StudioCondition = {
  dbSymbol: 'step_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
  ],
};

export const playTime: StudioCondition = {
  dbSymbol: 'play_time' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
  ],
};

export const playerState: StudioCondition = {
  dbSymbol: 'player_state' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['idle', 'walking', 'running', 'surfing', 'fishing', 'cycling', 'diving'],
    },
  ],
};

export const playerName: StudioCondition = {
  dbSymbol: 'player_name' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['String'],
  valueTypes: [
    {
      type: 'string',
    },
  ],
};
