import { ProjectData, TextsWithLanguageConfig, State } from '@src/GlobalStateProvider';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { getText, setText } from '@utils/ReadingProjectText';
import { jsonMember, jsonObject, jsonArrayMember, AnyT, TypedJSON } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

export const MoveCategories = ['physical', 'special', 'status'] as const;
export const MoveCriticalRate = [0, 1, 2, 3, 4] as const;
export const MoveTarget = [
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
export const MoveBattleEngineMethod = [
  's_basic',
  's_stat',
  's_status',
  's_multi_hit',
  's_2hits',
  's_ohko',
  's_2turns',
  's_self_stat',
  's_self_statut',
] as const;
export const MoveStatusList = ['POISONED', 'PARALYZED', 'BURN', 'ASLEEP', 'FROZEN', 'TOXIC', 'CONFUSED', 'DEATH', 'FLINCH'] as const;
export type BattleStageType = 'ATK_STAGE' | 'DFE_STAGE' | 'ATS_STAGE' | 'DFS_STAGE' | 'SPD_STAGE' | 'EVA_STAGE' | 'ACC_STAGE';

/**
 * This interface represents the stat change effect.
 */
export interface BattleStageMod {
  /**
   * The stat modified (example: DFS_STAGE)
   */
  battleStage: BattleStageType;

  /**
   * Value of the modificator (example: -1, 1, etc.)
   */
  modificator: number;
}

/**
 * This interface represents the move status.
 */
export interface MoveStatus {
  /**
   * The status effect.
   */
  status: string | null;

  /**
   * Value of the modificator (example: -1, 1, etc.)
   */
  luckRate: number;
}

/**
 * This class represents the model of the move.
 */
@jsonObject({
  onDeserialized: 'onDeserialized',
})
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
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * ID of the common event called when used on map.
   */
  @jsonMember(Number)
  mapUse!: number;

  /**
   * Symbol of the method to call in the Battle Engine to perform the move (be_method).
   */
  @jsonMember(String)
  battleEngineMethod!: string;

  /**
   * Type of the move.
   */
  @jsonMember(String)
  type!: string;

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
   * If the move requires recharging turn PokeAPI Prose : The turn after this move is used, the Pokemon's action is skipped so it can recharge.
   */
  @jsonMember(Boolean)
  isRecharge!: boolean;

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
   * If the move is a powder move PokeAPI Prose : Pokemon with overcoat ability and grass-type Pokemon are immune to this move.
   */
  @jsonMember(Boolean)
  isPowder!: boolean;

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
  @jsonArrayMember(AnyT)
  moveStatus!: MoveStatus[];

  /**
   * Chance that the secondary effect trigger.
   */
  @jsonMember(Number)
  effectChance!: number;

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: MoveModel.klass,
    id: 0,
    dbSymbol: 'new_move',
    type: 'normal',
    category: 'physical',
    isAuthentic: false,
    isBallistics: false,
    isBite: false,
    isBlocable: false,
    isCharge: false,
    isDance: false,
    isDirect: false,
    isDistance: false,
    isEffectChance: false,
    isGravity: false,
    isHeal: false,
    isKingRockUtility: false,
    isMagicCoatAffected: false,
    isMental: false,
    isMirrorMove: false,
    isNonSkyBattle: false,
    isPowder: false,
    isPulse: false,
    isPunch: false,
    isRecharge: false,
    isSnatchable: false,
    isSoundAttack: false,
    isUnfreeze: false,
    power: 0,
    pp: 0,
    priority: 0,
    accuracy: 0,
    movecriticalRate: 1,
    effectChance: 100,
    moveStatus: [],
    battleEngineMethod: 's_basic',
    battleStageMod: [],
    battleEngineAimedTarget: 'adjacent_pokemon',
    mapUse: 0,
  });

  /**
   * Get the description of the move
   * @returns The description of the move
   */
  descr = () => {
    if (!this.projectText) return `description of ${this.dbSymbol}`;
    return getText(this.projectText, 7, this.id);
  };

  /**
   * Set the description of the move
   */
  setDescr = (descr: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 7, this.id, descr);
  };

  /**
   * Get the name of the move
   * @returns The name of the move
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 6, this.id);
  };

  /**
   * Set the name of the move
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 6, this.id, name);
  };

  /**
   * Get all the Pokemon with the current level learnable move
   */
  getAllPokemonWithCurrentLevelLearnableMove = (state: State) => {
    return Object.values(state.projectData.pokemon).filter((pokemon) =>
      pokemon.forms.find((form) => form.levelLearnableMove.find((llm) => llm.move === this.dbSymbol))
    );
  };

  /**
   * Get all the Pokemon with the current tutor learnable move
   */
  getAllPokemonWithCurrentTutorLearnableMove = (state: State) => {
    return Object.values(state.projectData.pokemon).filter((pokemon) =>
      pokemon.forms.find((form) => form.tutorLearnableMove.find((tlm) => tlm.move === this.dbSymbol))
    );
  };

  /**
   * Get all the Pokemon with the current tech learnable move
   */
  getAllPokemonWithCurrentTechLearnableMove = (state: State) => {
    return Object.values(state.projectData.pokemon).filter((pokemon) =>
      pokemon.forms.find((form) => form.techLearnableMove.find((tlm) => tlm.move === this.dbSymbol))
    );
  };

  /**
   * Get all the Pokemon with the current breed learnable move
   */
  getAllPokemonWithCurrentBreedLearnableMove = (state: State) => {
    return Object.values(state.projectData.pokemon).filter((pokemon) =>
      pokemon.forms.find((form) => form.breedLearnableMove.find((blm) => blm.move === this.dbSymbol))
    );
  };

  /**
   * Get all the Pokemon with the current evolution learnable move
   */
  getAllPokemonWithCurrentEvolutionLearnableMove = (state: State) => {
    return Object.values(state.projectData.pokemon).filter((pokemon) =>
      pokemon.forms.find((form) => form.evolutionLearnableMove.find((elm) => elm.move === this.dbSymbol))
    );
  };

  /**
   * Clone the object
   */
  clone = (): MoveModel => {
    const newObject = new TypedJSON(MoveModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as MoveModel;
  };

  onDeserialized = (): void => {
    this.effectChance ??= 100;
  };

  /**
   * Remove useless move status
   * @param index The index of the status in move status
   */
  removeUselessMoveStatus = (index: number) => {
    if (this.moveStatus[index].status || this.moveStatus[index].luckRate !== 0) return;
    if (index === 0) this.moveStatus = [{ status: null, luckRate: 0 }];
    if (index === 1) this.moveStatus = [{ status: this.moveStatus[0].status, luckRate: this.moveStatus[0].luckRate }];
    if (index === 2) this.moveStatus.pop();
  };

  /**
   * Set the move status of the move
   * @param index The index of the status in move status
   * @param status The status to set
   */
  setMoveStatus = (index: number, status: string) => {
    if (index < this.moveStatus.length) this.moveStatus[index].status = status === '' ? null : status;
    else this.moveStatus.push({ status: status, luckRate: 0 });
    this.removeUselessMoveStatus(index);
  };

  /**
   * Set the luck rate of the move status of the move
   * @param index The index of the status in move status
   * @param luckRate The luck rate to set
   */
  setMoveStatusLuckRate = (index: number, luckRate: number) => {
    if (index < this.moveStatus.length) this.moveStatus[index].luckRate = luckRate;
    else this.moveStatus.push({ status: null, luckRate: luckRate });
    this.removeUselessMoveStatus(index);
  };

  /**
   * Create a default status if moveStatus array is empty
   */
  createDefaultStatus = () => {
    if (this.moveStatus.length === 0) this.moveStatus.push({ status: null, luckRate: 0 });
  };

  /**
   * Clean status
   */
  cleanStatus = () => {
    this.moveStatus = this.moveStatus.filter((moveStatus) => moveStatus.status !== null);
  };

  /**
   * Get the battle stage mod modificator
   * @param stageType The type of the battle stage
   * @returns The modificator of the battle stage
   */
  getBattleStageModModificator = (stageType: BattleStageType) => {
    if (this.battleStageMod.length === 0) return 0;
    const battleStage = this.battleStageMod.find((stat) => stat.battleStage === stageType);
    if (!battleStage) return 0;
    return battleStage.modificator;
  };

  /**
   * Set the battle stage mod modificator
   * @param stageType The type of the battle stage
   * @param modificator The modificator of the battle stage
   */
  setBattleStageMod = (stageType: BattleStageType, modificator: number) => {
    const currentStageMod = this.battleStageMod.find((stat) => stat.battleStage === stageType);
    if (!currentStageMod) {
      if (modificator !== 0) this.battleStageMod.push({ battleStage: stageType, modificator: modificator });
      return;
    }
    if (modificator !== 0) {
      currentStageMod.modificator = modificator;
      return;
    }
    this.battleStageMod.splice(this.battleStageMod.indexOf(currentStageMod), 1);
  };

  /**
   * Create a new move with default values
   * @param allMoves The project data containing the moves
   * @returns The new move
   */
  static createMove = (allMoves: ProjectData['moves']): MoveModel => {
    const newMove = new MoveModel();
    Object.assign(newMove, MoveModel.defaultValues());
    newMove.id = findFirstAvailableId(allMoves, 1);
    newMove.dbSymbol = '';
    return newMove;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.power = cleanNaNValue(this.power);
    this.accuracy = cleanNaNValue(this.accuracy);
    this.pp = cleanNaNValue(this.pp);
    this.priority = cleanNaNValue(this.priority);
    this.effectChance = cleanNaNValue(this.effectChance);
    this.mapUse = cleanNaNValue(this.mapUse);
    this.moveStatus.forEach((status) => (status.luckRate = cleanNaNValue(status.luckRate)));
    this.battleStageMod.forEach((bsm) => (bsm.modificator = cleanNaNValue(bsm.modificator)));
  };
}
