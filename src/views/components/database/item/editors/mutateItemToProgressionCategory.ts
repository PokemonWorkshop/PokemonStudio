import EVBoostItemModel from '@modelEntities/item/EVBoostItem.model';
import HealingItemModel from '@modelEntities/item/HealingItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import LevelIncreaseItemModel from '@modelEntities/item/LevelIncreaseItem.model';
import StatBoostItemModel from '@modelEntities/item/StatBoostItem.model';
import { assertUnreachable } from '@utils/assertUnreachable';

export const progressCategories = ['EV_PROGRESS', 'LEVEL_PROGRESS'] as const;
export type ProgressionCategory = typeof progressCategories[number];

export const mutateItemToProgressionCategory = (item: ItemModel, progressionCategory: ProgressionCategory): ItemModel => {
  if (item.klass === progressionCategory) return item;

  switch (progressionCategory) {
    case 'EV_PROGRESS':
      return item.mutateTo(EVBoostItemModel, item instanceof StatBoostItemModel ? StatBoostItemModel.klass : HealingItemModel.klass);
    case 'LEVEL_PROGRESS':
      return item.mutateTo(LevelIncreaseItemModel, HealingItemModel.klass);
    default:
      assertUnreachable(progressionCategory);
  }

  return item;
};
