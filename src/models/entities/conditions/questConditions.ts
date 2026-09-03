import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const questStatus: StudioCondition = {
  dbSymbol: 'quest_status' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'quest',
    },
  ],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['not_started', 'started', 'completed', 'failed'],
    },
  ],
};

export const questType: StudioCondition = {
  dbSymbol: 'quest_type' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'quest',
    },
  ],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['main', 'side'],
    },
  ],
};

// export const questObjectiveStatus: StudioCondition

export const rewardsClaimed: StudioCondition = {
  dbSymbol: 'rewards_claimed' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'quest',
    },
  ],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};
