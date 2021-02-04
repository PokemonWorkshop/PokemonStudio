import { jsonMember, jsonObject, jsonArrayMember, AnyT } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

/**
 * This interface represents the stat change effect.
 */
interface BattleStageMod {
  /**
   * The stat modified (example: DFS_STAGE)
   */
  battleStage: string;

  /**
   * Value of the modificator (example: -1, 1, etc.)
   */
  modificator: number;
}

/**
 * This interface represents the move status.
 */
interface MoveStatus {
  /**
   * The status effect.
   */
  status: string;

  /**
   * Value of the modificator (example: -1, 1, etc.)
   */
  luckRate: number;
}

/**
 * This class represents the model of the move.
 */
@jsonObject
export default class MoveModel implements PSDKEntity {
  static klass = 'Move';

  /**
   * The class of the move.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the move.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the move.
   */
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

  /**
   * ID of the common event called when used on map.
   */
  @jsonMember(Number)
  mapUse!: number;

  /**
   * Symbol of the method to call in the Battle Engine to perform the move (be_method).
   */
  @jsonMember(String, { preserveNull: true })
  battleEngineMethod!: string | null;

  /**
   * Type of the move.
   */
  @jsonMember(Number)
  type!: number;

  /**
   * Power of the move.
   */
  @jsonMember(Number)
  power!: number;

  /**
   * Accuracy of the move.
   */
  @jsonMember(Number)
  accuracy!: number;

  /**
   * Maximum amount of PP the move has when unused.
   */
  @jsonMember(Number)
  pp!: number;

  /**
   * Kind of move (Physical, Special or Status)
   */
  @jsonMember(String)
  category!: string;

  /**
   * Critical rate indicator : 0 => 0, 1 => 6.25%, 2 => 12.5%, 3 => 25%, 4 => 33%, 5 => 50%, 6 => 100%.
   */
  @jsonMember(Number)
  movecriticalRate!: number;

  /**
   * Priority of the move.
   */
  @jsonMember(Number)
  priority!: number;

  /**
   * If the move makes conctact.
   */
  @jsonMember(Boolean)
  isDirect!: boolean;

  /**
   * If the move is a charging move PokeAPI Prose: This move has a charging turn that can be skipped with a power-herb item.
   */
  @jsonMember(Boolean)
  isCharge!: boolean;

  /**
   * If the move is affected by Detect or Protect PokeAPI Prose : This move will not work if the target has used detect move or protect move this turn.
   */
  @jsonMember(Boolean)
  isBlocable!: boolean;

  /**
   * If the move is affected by Snatch PokeAPI Prose : This move will be stolen if another Pokemon has used snatch move this turn.
   */
  @jsonMember(Boolean)
  isSnatchable!: boolean;

  /**
   * If the move can be used by Mirror Move PokeAPI Prose : A Pokemon targeted by this move can use mirror-move move to copy it.
   */
  @jsonMember(Boolean)
  isMirrorMove!: boolean;

  /**
   * If the move is punch based PokeAPI Prose : This move has 1.2x its usual power when used by a Pokemon with iron-fist ability.
   */
  @jsonMember(Boolean)
  isPunch!: boolean;

  /**
   * If the move is affected by Gravity PokeAPI Prose : This move cannot be used in high gravity move.
   */
  @jsonMember(Boolean)
  isGravity!: boolean;

  /**
   * If the move is affected by Magic Coat PokeAPI Prose : This move may be reflected back at the user with magic-coat move or magic-bounce ability.
   */
  @jsonMember(Boolean)
  isMagicCoatAffected!: boolean;

  /**
   * If the move unfreeze the opponent Pokemon PokeAPI Prose : This move can be used while frozen to force the Pokemon to defrost.
   */
  @jsonMember(Boolean)
  isUnfreeze!: boolean;

  /**
   * If the move is a sound attack PokeAPI Prose : Pokemon with soundproof ability are immune to this move.
   */
  @jsonMember(Boolean)
  isSoundAttack!: boolean;

  /**
   * If the move can reach any target of the specied side/bank PokeAPI Prose : In triple battles, this move can be used on either side to target the farthest away foe Pokemon.
   */
  @jsonMember(Boolean)
  isDistance!: boolean;

  /**
   * If the move can be blocked by Heal Block PokeAPI Prose : This move is blocked by heal-block move.
   */
  @jsonMember(Boolean)
  isHeal!: boolean;

  /**
   * If the move ignore the substitute PokeAPI Prose : This move ignores the target's substitute move.
   */
  @jsonMember(Boolean)
  isAuthentic!: boolean;

  /**
   * If the move is bite based PokeAPI Prose : This move has 1.5x its usual power when used by a Pokemon with strong-jaw ability.
   */
  @jsonMember(Boolean)
  isBite!: boolean;

  /**
   * If the move is pulse based PokeAPI Prose : This move has 1.5x its usual power when used by a Pokemon with mega-launcher ability.
   */
  @jsonMember(Boolean)
  isPulse!: boolean;

  /**
   * If the move is a ballistics move PokeAPI Prose : This move is blocked by bulletproof ability.
   */
  @jsonMember(Boolean)
  isBallistics!: boolean;

  /**
   * If the move has mental effect PokeAPI Prose : This move is blocked by aroma-veil ability and cured by mental-herb item.
   */
  @jsonMember(Boolean)
  isMental!: boolean;

  /**
   * If the move cannot be used in Fly Battles PokeAPI Prose : This move is unusable during Sky Battles.
   */
  @jsonMember(Boolean)
  isNonSkyBattle!: boolean;

  /**
   * If the move is a dancing move PokeAPI Prose : This move triggers dancer ability.
   */
  @jsonMember(Boolean)
  isDance!: boolean;

  /**
   * If the move triggers King's Rock.
   */
  @jsonMember(Boolean)
  isKingRockUtility!: boolean;

  /**
   * If the chance of the effect (stat/status) can trigger.
   */
  @jsonMember(Boolean)
  isEffectChance!: boolean;

  /**
   * The Pokemon targeted by the move.
   */
  @jsonMember(String)
  battleEngineAimedTarget!: string;

  /**
   * Stat change effect.
   */
  @jsonArrayMember(AnyT)
  battleStageMod!: BattleStageMod[];

  /**
   * The status effect.
   */
  @jsonArrayMember(AnyT, { preserveNull: true })
  moveStatus!: MoveStatus[] | null;
}
