import BallItemModel from '@modelEntities/item/BallItem.model';
import EventItemModel from '@modelEntities/item/EventItem.model';
import FleeingItemModel from '@modelEntities/item/FleeingItem.model';
import HealingItemModel from '@modelEntities/item/HealingItem.model';
import ItemModel, { ItemCategory } from '@modelEntities/item/Item.model';
import RepelItemModel from '@modelEntities/item/RepelItem.model';
import StoneItemModel from '@modelEntities/item/StoneItem.model';
import TechItemModel from '@modelEntities/item/TechItem.model';
import { assertUnreachable } from '@utils/assertUnreachable';

export const mutateItemToCategory = (item: ItemModel, category: ItemCategory): ItemModel => {
  if (item.category === category) return item;

  switch (category) {
    case 'ball':
      return item.mutateTo(BallItemModel, ItemModel.klass);
    case 'event':
      return item.mutateTo(EventItemModel, ItemModel.klass);
    case 'fleeing':
      return item.mutateTo(FleeingItemModel, ItemModel.klass);
    case 'generic':
      return item.mutateTo(ItemModel, ItemModel.klass);
    case 'heal':
      return item.mutateTo(HealingItemModel, ItemModel.klass);
    case 'repel':
      return item.mutateTo(RepelItemModel, ItemModel.klass);
    case 'stone':
      return item.mutateTo(StoneItemModel, ItemModel.klass);
    case 'tech':
      return item.mutateTo(TechItemModel, ItemModel.klass);
    default:
      assertUnreachable(category);
  }

  return item;
};
