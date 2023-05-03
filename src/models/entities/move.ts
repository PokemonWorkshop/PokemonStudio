import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const MOVE_BATTLE_ENGINE_METHOD_VALIDATOR = z.string().regex(/^[a-z_][a-z0-9_]+$/, 'Invalid battleEngineMethod format');

export const MOVE_CATEGORY_VALIDATOR = z.union([z.literal('special'), z.literal('physical'), z.literal('status')]);
export type StudioMoveCategory = z.infer<typeof MOVE_CATEGORY_VALIDATOR>;

export const MOVE_CRITICAL_RATE_VALIDATOR = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export type StudioMoveCriticalRate = z.infer<typeof MOVE_CRITICAL_RATE_VALIDATOR>;

export const MOVE_BATTLE_ENGINE_AIMED_TARGET_VALIDATOR = z.union([
  z.literal('adjacent_pokemon'),
  z.literal('adjacent_foe'),
  z.literal('adjacent_all_foe'),
  z.literal('all_foe'),
  z.literal('adjacent_all_pokemon'),
  z.literal('all_pokemon'),
  z.literal('user'),
  z.literal('user_or_adjacent_ally'),
  z.literal('adjacent_ally'),
  z.literal('all_ally'),
  z.literal('any_other_pokemon'),
  z.literal('random_foe'),
]);
export type StudioMoveBattleEngineAimedTarget = z.infer<typeof MOVE_BATTLE_ENGINE_AIMED_TARGET_VALIDATOR>;

export const MOVE_BATTLE_STAGE_VALIDATOR = z.union([
  z.literal('ATK_STAGE'),
  z.literal('DFE_STAGE'),
  z.literal('ATS_STAGE'),
  z.literal('DFS_STAGE'),
  z.literal('SPD_STAGE'),
  z.literal('EVA_STAGE'),
  z.literal('ACC_STAGE'),
]);
export type StudioMoveBattleStage = z.infer<typeof MOVE_BATTLE_STAGE_VALIDATOR>;

export const MOVE_BATTLE_STAGE_MOD_VALIDATOR = z.object({
  battleStage: MOVE_BATTLE_STAGE_VALIDATOR,
  modificator: z.number().finite(),
});
export type StudioBattleStageMod = z.infer<typeof MOVE_BATTLE_STAGE_MOD_VALIDATOR>;

export const MOVE_STATUS_LIST_VALIDATOR = z.union([
  z.literal('POISONED'),
  z.literal('PARALYZED'),
  z.literal('BURN'),
  z.literal('ASLEEP'),
  z.literal('FROZEN'),
  z.literal('TOXIC'),
  z.literal('CONFUSED'),
  z.literal('DEATH'),
  z.literal('FLINCH'),
  z.literal(null),
]);
export type StudioMoveStatusList = z.infer<typeof MOVE_STATUS_LIST_VALIDATOR>;

export const MOVE_STATUS_VALIDATOR = z.object({
  status: MOVE_STATUS_LIST_VALIDATOR,
  luckRate: POSITIVE_OR_ZERO_INT,
});
export type StudioMoveStatus = z.infer<typeof MOVE_STATUS_VALIDATOR>;

export const MOVE_VALIDATOR = z.object({
  klass: z.literal('Move'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  mapUse: POSITIVE_OR_ZERO_INT,
  battleEngineMethod: MOVE_BATTLE_ENGINE_METHOD_VALIDATOR,
  type: DB_SYMBOL_VALIDATOR,
  power: POSITIVE_OR_ZERO_INT,
  accuracy: POSITIVE_OR_ZERO_INT,
  pp: POSITIVE_OR_ZERO_INT,
  category: MOVE_CATEGORY_VALIDATOR,
  movecriticalRate: MOVE_CRITICAL_RATE_VALIDATOR,
  priority: z.number().finite(),
  isAuthentic: z.boolean(),
  isBallistics: z.boolean(),
  isBite: z.boolean(),
  isBlocable: z.boolean(),
  isCharge: z.boolean(),
  isDance: z.boolean(),
  isDirect: z.boolean(),
  isDistance: z.boolean(),
  isEffectChance: z.boolean().default(false),
  isGravity: z.boolean(),
  isHeal: z.boolean(),
  isKingRockUtility: z.boolean(),
  isMagicCoatAffected: z.boolean(),
  isMental: z.boolean(),
  isMirrorMove: z.boolean(),
  isNonSkyBattle: z.boolean(),
  isPowder: z.boolean(),
  isPulse: z.boolean(),
  isPunch: z.boolean(),
  isRecharge: z.boolean(),
  isSnatchable: z.boolean(),
  isSoundAttack: z.boolean(),
  isUnfreeze: z.boolean(),
  battleEngineAimedTarget: MOVE_BATTLE_ENGINE_AIMED_TARGET_VALIDATOR,
  battleStageMod: z.array(MOVE_BATTLE_STAGE_MOD_VALIDATOR),
  moveStatus: z.array(MOVE_STATUS_VALIDATOR),
  effectChance: POSITIVE_OR_ZERO_INT.default(100),
});

export type StudioMove = z.infer<typeof MOVE_VALIDATOR>;
export type MoveBattleEngineMethodsType =
  | 's_basic'
  | 's_stat'
  | 's_status'
  | 's_multi_hit'
  | 's_2hits'
  | 's_ohko'
  | 's_2turns'
  | 's_self_stat'
  | 's_self_status';

export const MOVE_NAME_TEXT_ID = 100006;
export const MOVE_DESCRIPTION_TEXT_ID = 100007;
export const MOVE_CATEGORIES = ['physical', 'special', 'status'] as const;
export const MOVE_CRITICAL_RATES = [0, 1, 2, 3, 4] as const;
export const MOVE_TARGETS = [
  'adjacent_pokemon',
  'adjacent_foe',
  'adjacent_all_foe',
  'all_foe',
  'adjacent_all_pokemon',
  'all_pokemon',
  'user',
  'user_or_adjacent_ally',
  'adjacent_ally',
  'all_ally',
  'any_other_pokemon',
  'random_foe',
] as const;
export const MOVE_BATTLE_ENGINE_METHODS: Readonly<MoveBattleEngineMethodsType[]> = [
  's_basic',
  's_stat',
  's_status',
  's_multi_hit',
  's_2hits',
  's_ohko',
  's_2turns',
  's_self_stat',
  's_self_status',
] as const;
export const MOVE_STATUS_LIST = ['POISONED', 'PARALYZED', 'BURN', 'ASLEEP', 'FROZEN', 'TOXIC', 'CONFUSED', 'DEATH', 'FLINCH'] as const;
export const TEXT_CRITICAL_RATES = ['no_critical_hit', 'normal', 'high', 'very_high', 'guaranteed'] as const;

/**
 * Get the battle stage mod modificator
 * @param stageType The type of the battle stage
 * @returns The modificator of the battle stage
 */
export const getBattleStageModModificator = (move: StudioMove, stageType: StudioMoveBattleStage) => {
  if (move.battleStageMod.length === 0) return 0;
  const battleStage = move.battleStageMod.find((stat) => stat.battleStage === stageType);
  if (!battleStage) return 0;
  return battleStage.modificator;
};
