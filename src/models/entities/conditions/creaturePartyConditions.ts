import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const partySize: StudioCondition = {
  dbSymbol: 'party_size' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};

export const partyFull: StudioCondition = {
  dbSymbol: 'party_full' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const creatureInParty: StudioCondition = {
  dbSymbol: 'creature_in_party' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['CollectionMembership'],
  valueTypes: [
    {
      type: 'database_reference',
      referenceType: 'creature',
    },
  ],
};

export const creatureInPC: StudioCondition = {
  dbSymbol: 'creature_in_pc' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['CollectionMembership'],
  valueTypes: [
    {
      type: 'database_reference',
      referenceType: 'creature',
    },
  ],
};

export const PCFull: StudioCondition = {
  dbSymbol: 'pc_full' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

// All remaining condition that needs a Pokémon picked first
