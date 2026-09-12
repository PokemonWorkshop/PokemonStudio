import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const itemOwned: StudioCondition = {
  dbSymbol: 'item_owned' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'database_reference',
      referenceType: 'item',
    },
  ],
};

export const itemCategoryOwned: StudioCondition = {
  dbSymbol: 'item_category_owned' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'database_reference',
      referenceType: 'itemCategory',
    },
  ],
};

export const itemQuantity: StudioCondition = {
  dbSymbol: 'item_quantity' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'item',
    },
  ],
  valueTypes: [
    {
      type: 'number',
      minimum: 0,
      maximum: 999999999,
      step: 1,
    },
  ],
};

export const repelActive: StudioCondition = {
  dbSymbol: 'repel_active' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Boolean'],
  valueTypes: [
    {
      type: 'boolean',
    },
  ],
};
