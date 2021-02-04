import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

/**
 * This interface gives the defensive type and the associated damage multiplier.
 */
interface DamageTo {
  /**
   * The defensive type.
   */
  defensiveType: number;

  /**
   * Return the damage multiplier.
   */
  factor: number;
}

/**
 * This class represents a type.
 */
@jsonObject
export default class TypeModel implements PSDKEntity {
  static klass = 'Type';

  /**
   * The class of the type.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the type.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the type.
   */
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

  /**
   * ID of the text that gives the type name.
   */
  @jsonMember(Number)
  textId!: number;

  /**
   * A list containing the defensive types and the associated damage multipliers.
   */
  @jsonArrayMember(AnyT)
  damageTo!: DamageTo[];
}
