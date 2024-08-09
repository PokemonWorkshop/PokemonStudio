import { mutateItemInto, StudioItem } from '@modelEntities/item';
import { createItem } from '@utils/entityCreation';

export const HealingItemCategories = [
  'HealingItem',
  'ConstantHealItem',
  'StatusConstantHealItem',
  'RateHealItem',
  'StatusRateHealItem',
  'StatBoostItem',
  'EVBoostItem',
  'LevelIncreaseItem',
  'ExpGiveItem',
  'PPIncreaseItem',
  'PPHealItem',
  'AllPPHealItem',
  'StatusHealItem',
] as const;
export type HealingCategories = (typeof HealingItemCategories)[number];

export const mutateItemToProgressionCategory = (item: StudioItem, healingCategory: HealingCategories) => {
  if (item.klass === healingCategory) return item;

  return mutateItemInto(item, createItem(healingCategory, item.dbSymbol, item.id));
};
