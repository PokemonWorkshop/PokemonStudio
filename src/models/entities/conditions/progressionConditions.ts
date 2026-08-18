import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const badgeOwned: StudioCondition = {
  dbSymbol: 'badge_owned' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      step: 1,
    },
  ],
};

export const badgeCount: StudioCondition = {
  dbSymbol: 'badge_count' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 99,
      step: 1,
    },
  ],
};

export const bestiaryObtained: StudioCondition = {
  dbSymbol: 'bestiary_obtained' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};

export const bestiaryVariantActive: StudioCondition = {
  dbSymbol: 'bestiary_variant_active' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'entity',
      entityKind: 'bestiary',
    },
  ],
};

export const starterChosen: StudioCondition = {
  dbSymbol: 'starter_chosen' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'entity',
      entityKind: 'creature',
    },
  ],
};
