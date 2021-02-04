import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import Encounter from '../Encounter.model';
import PSDKEntity from '../PSDKEntity';

/**
 * This class represents a trainer.
 */
@jsonObject
export default class TrainerModel implements PSDKEntity {
  static klass = 'TrainerBattleSetup';

  /**
   * The class of the trainer.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the trainer.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the trainer.
   */
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

  /**
   * The battle type 1v1, 2v2, 3v3…
   */
  @jsonMember(Number)
  vsType!: number;

  /**
   * If the trainers are a couple
   */
  @jsonMember(Boolean)
  isCouple!: boolean;

  /**
   * The value that is multiplied to the last pokemon level to get the money the trainer gives.
   */
  @jsonMember(Number)
  baseMoney!: number;

  /**
   * The name of the battler in Graphics/Battlers.
   */
  @jsonArrayMember(String)
  battlers!: string[];

  /**
   * The list of item of bag of the trainer.
   */
  @jsonArrayMember(AnyT)
  bags!: any[];

  /**
   * The group of battle.
   */
  @jsonMember(Number)
  battleId!: number;

  /**
   * ID of AI of the trainer.
   */
  @jsonMember(Number)
  ai!: number;

  /**
   * The parties of the trainer.
   */
  @jsonArrayMember(AnyT)
  parties!: Encounter[];
}
