import AllPPHealItemModel from '@modelEntities/item/AllPPHealItem.model';
import ConstantHealItemModel from '@modelEntities/item/ConstantHealItem.model';
import EVBoostItemModel from '@modelEntities/item/EVBoostItem.model';
import HealingItemModel from '@modelEntities/item/HealingItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import LevelIncreaseItemModel from '@modelEntities/item/LevelIncreaseItem.model';
import PPHealItemModel from '@modelEntities/item/PPHealItem.model';
import PPIncreaseItemModel from '@modelEntities/item/PPIncreaseItem.model';
import RateHealItemModel from '@modelEntities/item/RateHealItem.model';
import StatBoostItemModel from '@modelEntities/item/StatBoostItem.model';
import StatusConstantHealItemModel from '@modelEntities/item/StatusConstantHealItem.model';
import StatusHealItemModel from '@modelEntities/item/StatusHealItem.model';
import StatusRateHealItemModel from '@modelEntities/item/StatusRateHealItem.model';
import { assertUnreachable } from '@utils/assertUnreachable';

export const HealingItemCategories = [
  'HealingItem',
  'ConstantHealItem',
  'StatusConstantHealItem',
  'RateHealItem',
  'StatusRateHealItem',
  'StatBoostItem',
  'EVBoostItem',
  'LevelIncreaseItem',
  'PPIncreaseItem',
  'PPHealItem',
  'AllPPHealItem',
  'StatusHealItem',
] as const;
export type HealingCategories = typeof HealingItemCategories[number];

export const mutateItemToProgressionCategory = (item: ItemModel, healingCategory: HealingCategories): ItemModel => {
  if (item.klass === healingCategory) return item;

  switch (healingCategory) {
    case 'HealingItem':
      return item.mutateTo(HealingItemModel, HealingItemModel.klass);
    case 'ConstantHealItem':
      return item.mutateTo(ConstantHealItemModel, item instanceof ConstantHealItemModel ? ConstantHealItemModel.klass : HealingItemModel.klass);
    case 'StatusConstantHealItem':
      return item.mutateTo(StatusConstantHealItemModel, item instanceof ConstantHealItemModel ? ConstantHealItemModel.klass : HealingItemModel.klass);
    case 'RateHealItem':
      return item.mutateTo(RateHealItemModel, item instanceof RateHealItemModel ? RateHealItemModel.klass : HealingItemModel.klass);
    case 'StatusRateHealItem':
      return item.mutateTo(StatusRateHealItemModel, item instanceof RateHealItemModel ? RateHealItemModel.klass : HealingItemModel.klass);
    case 'StatBoostItem':
      return item.mutateTo(StatBoostItemModel, HealingItemModel.klass);
    case 'EVBoostItem':
      return item.mutateTo(EVBoostItemModel, HealingItemModel.klass);
    case 'LevelIncreaseItem':
      return item.mutateTo(LevelIncreaseItemModel, HealingItemModel.klass);
    case 'PPIncreaseItem':
      return item.mutateTo(PPIncreaseItemModel, HealingItemModel.klass);
    case 'PPHealItem':
      return item.mutateTo(PPHealItemModel, item instanceof PPHealItemModel ? PPHealItemModel.klass : HealingItemModel.klass);
    case 'AllPPHealItem':
      return item.mutateTo(AllPPHealItemModel, item instanceof PPHealItemModel ? PPHealItemModel.klass : HealingItemModel.klass);
    case 'StatusHealItem':
      return item.mutateTo(StatusHealItemModel, HealingItemModel.klass);
    default:
      assertUnreachable(healingCategory);
  }

  return item;
};
