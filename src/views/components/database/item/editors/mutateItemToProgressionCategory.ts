import { mutateItemInto, StudioItem } from '@modelEntities/item';
import { assertUnreachable } from '@utils/assertUnreachable';
import { createItem } from '@utils/entityCreation';

export const progressCategories = ['EV_PROGRESS', 'LEVEL_PROGRESS'] as const;
export type ProgressionCategory = typeof progressCategories[number];
const itemKlassToProgressionCategory: Readonly<Record<StudioItem['klass'], ProgressionCategory | 'unknown'>> = {
  AllPPHealItem: 'unknown',
  BallItem: 'unknown',
  ConstantHealItem: 'unknown',
  EVBoostItem: 'EV_PROGRESS',
  EventItem: 'unknown',
  FleeingItem: 'unknown',
  HealingItem: 'unknown',
  Item: 'unknown',
  LevelIncreaseItem: 'LEVEL_PROGRESS',
  PPHealItem: 'unknown',
  PPIncreaseItem: 'unknown',
  RateHealItem: 'unknown',
  RepelItem: 'unknown',
  StatBoostItem: 'unknown',
  StatusConstantHealItem: 'unknown',
  StatusHealItem: 'unknown',
  StatusRateHealItem: 'unknown',
  StoneItem: 'unknown',
  TechItem: 'unknown',
} as const;

export const mutateItemToProgressionCategory = (item: StudioItem, progressionCategory: ProgressionCategory) => {
  if (itemKlassToProgressionCategory[item.klass] === progressionCategory) return item;

  switch (progressionCategory) {
    case 'EV_PROGRESS':
      return mutateItemInto(item, createItem('EVBoostItem', item.dbSymbol, item.id));
    case 'LEVEL_PROGRESS':
      return mutateItemInto(item, createItem('LevelIncreaseItem', item.dbSymbol, item.id));
    default:
      assertUnreachable(progressionCategory);
  }

  return item;
};
