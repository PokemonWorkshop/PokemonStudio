import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const booleanVariable: StudioCondition = {
  dbSymbol: 'boolean_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  subjectTypes: [
    {
      type: 'variable',
      variableType: 'boolean',
    },
  ],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const booleanEventVariable: StudioCondition = {
  dbSymbol: 'boolean_event_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  subjectTypes: [
    {
      type: 'event_variable',
      variableType: 'boolean',
    },
  ],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const numberVariable: StudioCondition = {
  dbSymbol: 'number_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  subjectTypes: [
    {
      type: 'variable',
      variableType: 'number',
    },
  ],
  valueTypes: [
    {
      type: 'number',
      step: 0.01,
    },
  ],
};

export const numberEventVariable: StudioCondition = {
  dbSymbol: 'number_event_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  subjectTypes: [
    {
      type: 'event_variable',
      variableType: 'number',
    },
  ],
  valueTypes: [
    {
      type: 'number',
      step: 0.01,
    },
  ],
};

export const stringVariable: StudioCondition = {
  dbSymbol: 'string_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'variable',
      variableType: 'string',
    },
  ],
  valueTypes: [
    {
      type: 'string',
    },
  ],
};

export const stringEventVariable: StudioCondition = {
  dbSymbol: 'string_event_variable' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'event_variable',
      variableType: 'string',
    },
  ],
  valueTypes: [
    {
      type: 'string',
    },
  ],
};
