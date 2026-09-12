import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const seenCreatureCount: StudioCondition = {
  dbSymbol: 'seen_creature_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};

export const caughtCreatureCount: StudioCondition = {
  dbSymbol: 'caught_creature_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};

export const creatureSeen: StudioCondition = {
  dbSymbol: 'creature_seen' as DbSymbol,
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

export const creatureCaught: StudioCondition = {
  dbSymbol: 'creature_caught' as DbSymbol,
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

export const bestiaryCompleted: StudioCondition = {
  dbSymbol: 'bestiary_completed' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'bestiary',
    },
  ],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};
