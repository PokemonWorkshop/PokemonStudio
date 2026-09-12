import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const timer: StudioCondition = {
  dbSymbol: 'timer' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'time',
    },
  ],
};

export const weather: StudioCondition = {
  dbSymbol: 'weather' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['none', 'sun', 'hard_sun', 'rain', 'hard_rain', 'hail', 'snow', 'sandstorm', 'fog'],
    },
  ],
};

export const timeOfDay: StudioCondition = {
  dbSymbol: 'time_of_day' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['morning', 'day', 'evening', 'night'],
    },
  ],
};
