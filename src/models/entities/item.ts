import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT, POSITIVE_INT, POSITIVE_FLOAT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

const ITEM_BASE_VALIDATOR = z.object({
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  icon: z.string(),
  price: POSITIVE_OR_ZERO_INT,
  socket: POSITIVE_OR_ZERO_INT,
  position: z.number(),
  isBattleUsable: z.boolean(),
  isMapUsable: z.boolean(),
  isLimited: z.boolean(),
  isHoldable: z.boolean(),
  flingPower: POSITIVE_OR_ZERO_INT,
});

export const UNKNOWN_ITEM_VALIDATOR = ITEM_BASE_VALIDATOR.extend({
  klass: z.literal('Item'),
});
export type StudioUnknownItem = z.infer<typeof UNKNOWN_ITEM_VALIDATOR>;

export const HEALING_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('HealingItem'),
  loyaltyMalus: z.number().finite(),
});
export type StudioHealingItem = z.infer<typeof HEALING_ITEM_VALIDATOR>;

export const PP_HEALING_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('PPHealItem'),
  ppCount: POSITIVE_INT,
});
export type StudioPPHealingItem = z.infer<typeof PP_HEALING_ITEM_VALIDATOR>;

export const ALL_PP_HEALING_ITEM_VALIDATOR = PP_HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('AllPPHealItem'),
});
export type StudioAllPPHealingItem = z.infer<typeof ALL_PP_HEALING_ITEM_VALIDATOR>;

export const BALL_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('BallItem'),
  spriteFilename: z.string(),
  catchRate: z.number(),
  color: z.object({
    red: POSITIVE_OR_ZERO_INT.max(255),
    green: POSITIVE_OR_ZERO_INT.max(255),
    blue: POSITIVE_OR_ZERO_INT.max(255),
    alpha: POSITIVE_OR_ZERO_INT.max(255),
  }),
});
export type StudioBallItem = z.infer<typeof BALL_ITEM_VALIDATOR>;

export const CONSTANT_HEALING_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('ConstantHealItem'),
  hpCount: POSITIVE_INT,
});
export type StudioConstantHealingItem = z.infer<typeof CONSTANT_HEALING_ITEM_VALIDATOR>;

export const STAT_BOOST_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('StatBoostItem'),
  count: z.number().finite(),
  stat: z.union([
    z.literal('ATK_STAGE'),
    z.literal('ATS_STAGE'),
    z.literal('DFE_STAGE'),
    z.literal('DFS_STAGE'),
    z.literal('SPD_STAGE'),
    z.literal('EVA_STAGE'),
    z.literal('ACC_STAGE'),
  ]),
});
export type StudioStatBoostItem = z.infer<typeof STAT_BOOST_ITEM_VALIDATOR>;

export const EV_BOOST_ITEM_VALIDATOR = STAT_BOOST_ITEM_VALIDATOR.extend({
  klass: z.literal('EVBoostItem'),
  stat: z.union([z.literal('HP'), z.literal('ATK'), z.literal('ATS'), z.literal('DFE'), z.literal('DFS'), z.literal('SPD'), z.literal('EVA')]),
});
export type StudioEVBoostItem = z.infer<typeof EV_BOOST_ITEM_VALIDATOR>;

export const EVENT_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('EventItem'),
  eventId: POSITIVE_INT,
});
export type StudioEventItem = z.infer<typeof EVENT_ITEM_VALIDATOR>;

export const FLEEING_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('FleeingItem'),
});
export type StudioFleeingItem = z.infer<typeof FLEEING_ITEM_VALIDATOR>;

export const LEVEL_INCREASE_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('LevelIncreaseItem'),
  levelCount: POSITIVE_INT,
});
export type StudioLevelIncreaseItem = z.infer<typeof LEVEL_INCREASE_ITEM_VALIDATOR>;

export const PP_INCREASE_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('PPIncreaseItem'),
  isMax: z.boolean(),
});
export type StudioPPIncreaseItem = z.infer<typeof PP_INCREASE_ITEM_VALIDATOR>;

export const RATE_HEALING_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('RateHealItem'),
  hpRate: POSITIVE_FLOAT,
});
export type StudioRateHealingItem = z.infer<typeof RATE_HEALING_ITEM_VALIDATOR>;

export const REPEL_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('RepelItem'),
  repelCount: POSITIVE_INT,
});
export type StudioRepelItem = z.infer<typeof REPEL_ITEM_VALIDATOR>;

export const STATUS_VALIDATOR = z.union([
  z.literal('POISONED'),
  z.literal('PARALYZED'),
  z.literal('BURN'),
  z.literal('ASLEEP'),
  z.literal('FROZEN'),
  z.literal('CONFUSED'),
  z.literal('TOXIC'),
  z.literal('DEATH'),
  z.literal('FLINCH'),
]);
export type StudioItemStatusCondition = z.infer<typeof STATUS_VALIDATOR>;
export const STATUS_CONSTANT_HEALING_ITEM_VALIDATOR = CONSTANT_HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('StatusConstantHealItem'),
  statusList: z.array(STATUS_VALIDATOR),
});
export type StudioStatusConstantHealingItem = z.infer<typeof STATUS_CONSTANT_HEALING_ITEM_VALIDATOR>;

export const STATUS_HEALING_ITEM_VALIDATOR = HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('StatusHealItem'),
  statusList: z.array(STATUS_VALIDATOR),
});
export type StudioStatusHealingItem = z.infer<typeof STATUS_HEALING_ITEM_VALIDATOR>;

export const STATUS_RATE_HEALING_ITEM_VALIDATOR = RATE_HEALING_ITEM_VALIDATOR.extend({
  klass: z.literal('StatusRateHealItem'),
  statusList: z.array(STATUS_VALIDATOR),
});
export type StudioStatusRateHealingItem = z.infer<typeof STATUS_RATE_HEALING_ITEM_VALIDATOR>;

export const STONE_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('StoneItem'),
});
export type StudioStoneItem = z.infer<typeof STONE_ITEM_VALIDATOR>;

export const TECH_ITEM_VALIDATOR = UNKNOWN_ITEM_VALIDATOR.extend({
  klass: z.literal('TechItem'),
  isHm: z.boolean(),
  move: DB_SYMBOL_VALIDATOR,
});
export type StudioTechItem = z.infer<typeof TECH_ITEM_VALIDATOR>;

export const ITEM_VALIDATOR = z.discriminatedUnion('klass', [
  UNKNOWN_ITEM_VALIDATOR,
  HEALING_ITEM_VALIDATOR,
  PP_HEALING_ITEM_VALIDATOR,
  ALL_PP_HEALING_ITEM_VALIDATOR,
  BALL_ITEM_VALIDATOR,
  CONSTANT_HEALING_ITEM_VALIDATOR,
  STAT_BOOST_ITEM_VALIDATOR,
  EV_BOOST_ITEM_VALIDATOR,
  EVENT_ITEM_VALIDATOR,
  FLEEING_ITEM_VALIDATOR,
  LEVEL_INCREASE_ITEM_VALIDATOR,
  PP_INCREASE_ITEM_VALIDATOR,
  RATE_HEALING_ITEM_VALIDATOR,
  REPEL_ITEM_VALIDATOR,
  STATUS_CONSTANT_HEALING_ITEM_VALIDATOR,
  STATUS_HEALING_ITEM_VALIDATOR,
  STATUS_RATE_HEALING_ITEM_VALIDATOR,
  STONE_ITEM_VALIDATOR,
  TECH_ITEM_VALIDATOR,
]);
export type StudioItem = z.infer<typeof ITEM_VALIDATOR>;

export const ITEM_DESCRIPTION_TEXT_ID = 13;
export const ITEM_NAME_TEXT_ID = 12;
export const ITEM_PLURAL_NAME_TEXT_ID = -90_999; // 9001 - 100000
export const ITEM_POCKET_NAME_TEXT_ID = 15;

export const StudioItemCategories = ['ball', 'heal', 'repel', 'fleeing', 'event', 'stone', 'tech', 'generic'] as const;
export type StudioItemCategory = typeof StudioItemCategories[number];
export type StudioItemEditors = 'generic' | 'parameters' | 'exploration' | 'battle' | 'tech' | 'progress' | 'heal' | 'catch' | 'berries' | 'cooking';

export const LOCKED_ITEM_EDITOR: Readonly<Record<StudioItem['klass'], Readonly<StudioItemEditors[]>>> = {
  AllPPHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  BallItem: ['exploration', 'battle', 'progress', 'heal', 'berries', 'cooking'] as const,
  ConstantHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  EVBoostItem: ['exploration', 'battle', 'catch'] as const,
  EventItem: ['battle', 'progress', 'catch', 'heal', 'berries', 'cooking'] as const,
  FleeingItem: ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'] as const,
  HealingItem: ['exploration', 'progress', 'catch', 'battle'] as const,
  Item: ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'] as const,
  LevelIncreaseItem: ['exploration', 'battle', 'catch'] as const,
  PPHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  PPIncreaseItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  RateHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  RepelItem: ['battle', 'progress', 'heal', 'catch', 'berries', 'cooking'] as const,
  StatBoostItem: ['exploration', 'progress', 'catch'] as const,
  StatusConstantHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  StatusHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  StatusRateHealItem: ['exploration', 'battle', 'progress', 'catch'] as const,
  StoneItem: ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'] as const,
  TechItem: ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'] as const,
} as const;

export const ITEM_CATEGORY: Readonly<Record<StudioItem['klass'], StudioItemCategory>> = {
  AllPPHealItem: 'heal',
  BallItem: 'ball',
  ConstantHealItem: 'heal',
  EVBoostItem: 'heal',
  EventItem: 'event',
  FleeingItem: 'fleeing',
  HealingItem: 'heal',
  Item: 'generic',
  LevelIncreaseItem: 'heal',
  PPHealItem: 'heal',
  PPIncreaseItem: 'heal',
  RateHealItem: 'heal',
  RepelItem: 'repel',
  StatBoostItem: 'heal',
  StatusConstantHealItem: 'heal',
  StatusHealItem: 'heal',
  StatusRateHealItem: 'heal',
  StoneItem: 'stone',
  TechItem: 'tech',
} as const;
export const ITEM_CATEGORY_INITIAL_CLASSES: Readonly<Record<StudioItemCategory, StudioItem['klass']>> = {
  ball: 'BallItem',
  event: 'EventItem',
  fleeing: 'FleeingItem',
  generic: 'Item',
  heal: 'HealingItem',
  repel: 'RepelItem',
  stone: 'StoneItem',
  tech: 'TechItem',
} as const;

export const mutateItemInto = <K extends StudioItem['klass']>(
  originItem: StudioItem,
  targetItem: Extract<StudioItem, { klass: K }>
): typeof targetItem => {
  const { id, dbSymbol, icon, price, socket, position, isBattleUsable, isMapUsable, isLimited, isHoldable, flingPower } = originItem;
  const newItem = { ...targetItem, id, dbSymbol, icon, price, socket, position, isBattleUsable, isMapUsable, isLimited, isHoldable, flingPower };

  if ('loyaltyMalus' in originItem && 'loyaltyMalus' in newItem) newItem.loyaltyMalus = originItem.loyaltyMalus;
  if ('ppCount' in originItem && 'ppCount' in newItem) newItem.ppCount = originItem.ppCount;
  if ('count' in originItem && 'count' in newItem) newItem.count = originItem.count;
  if ('hpCount' in originItem && 'hpCount' in newItem) newItem.hpCount = originItem.hpCount;
  if ('hpRate' in originItem && 'hpRate' in newItem) newItem.hpRate = originItem.hpRate;
  if ('statusList' in originItem && 'statusList' in newItem) newItem.statusList = originItem.statusList;

  return newItem;
};
