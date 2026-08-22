import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const inputKey: StudioCondition = {
  dbSymbol: 'input_key' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Input'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const KeyHoldDuration: StudioCondition = {
  dbSymbol: 'key_hold_duration' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'time',
    },
  ],
};

export const repeatedInput: StudioCondition = {
  dbSymbol: 'repeated_input' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};
