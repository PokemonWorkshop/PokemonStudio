import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const followersCount: StudioCondition = {
  dbSymbol: 'followers_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};

export const followMeActive: StudioCondition = {
  dbSymbol: 'follow_me_active' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const followMeLetsGoActive: StudioCondition = {
  dbSymbol: 'follow_me_lets_go_active' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};
