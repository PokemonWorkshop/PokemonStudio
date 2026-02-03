import { StudioItemCategory } from '@modelEntities/item';

export type ItemCategoryTextProps = {
  itemCategory: StudioItemCategory | undefined;
};

export const ITEM_CATEGORY_DESCRIPTIONS: Record<StudioItemCategory, string> = {
  ball: 'item_category_description_ball',
  event: 'item_category_description_event',
  fleeing: 'item_category_description_fleeing',
  generic: 'item_category_description_generic',
  heal: 'item_category_description_heal',
  repel: 'item_category_description_repel',
  stone: 'item_category_description_stone',
  tech: 'item_category_description_tech',
};