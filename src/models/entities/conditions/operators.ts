export const CONDITION_OPERATOR_LIST = [
  'is_true',
  'is_false',
  'equal',
  'not_equal',
  'less_than',
  'less_than_or_equal',
  'greater_than',
  'greater_than_or_equal',
  'is',
  'is_not',
  'is_one_of',
  'is_not_one_of',
  'has',
  'not_have',
  'contains',
  'not_contain',
] as const;
export type StudioConditionOperator = (typeof CONDITION_OPERATOR_LIST)[number];

export type StudioConditionOperatorGroup = 'Boolean' | 'Number' | 'Enumerator' | 'Ownership' | 'CollectionMembership';

export const CONDITION_OPERATOR_GROUPS: Readonly<Record<StudioConditionOperatorGroup, Readonly<StudioConditionOperator[]>>> = {
  Boolean: ['is_true', 'is_false'] as const,
  Number: ['equal', 'not_equal', 'less_than', 'less_than_or_equal', 'greater_than', 'greater_than_or_equal'] as const,
  Enumerator: ['is', 'is_not', 'is_one_of', 'is_not_one_of'] as const,
  Ownership: ['has', 'not_have'] as const,
  CollectionMembership: ['contains', 'not_contain'] as const,
} as const;
