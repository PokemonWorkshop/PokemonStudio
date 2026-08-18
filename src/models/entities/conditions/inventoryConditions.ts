import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const itemOwned: StudioCondition = {
  dbSymbol: 'item_owned' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'enum',
      valueList: 'items',
    },
  ],
};

export const itemCategoryOwned: StudioCondition = {
  dbSymbol: 'item_category_owned' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Ownership'],
  valueTypes: [
    {
      type: 'enum',
      valueList: 'itemCategories',
    },
  ],
};

export const itemQuantity: StudioCondition = {
  dbSymbol: 'item_quantity' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Number'],
  subjectTypes: [
    {
      type: 'entity',
      entityKind: 'item',
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
