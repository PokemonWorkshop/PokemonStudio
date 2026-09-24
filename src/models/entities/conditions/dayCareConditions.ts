import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const eggAvailable: StudioCondition = {
  dbSymbol: 'egg_available' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const creatureInDayCare: StudioCondition = {
  dbSymbol: 'creature_in_day_care' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'creature',
    },
  ],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const creatureInDayCareCount: StudioCondition = {
  dbSymbol: 'creature_in_day_care_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};
