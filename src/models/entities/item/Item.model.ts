import { jsonMember, jsonObject } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

/**
 * This class represents an item.
 */
@jsonObject
export default class ItemModel implements PSDKEntity {
  static klass = 'Item';

  /**
   * The class of the item.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the item.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the item.
   */
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

  /**
   * Name of the item icon in Graphics/Icons/.
   */
  @jsonMember(String)
  icon!: string;

  /**
   * Price of the item.
   */
  @jsonMember(Number)
  price!: number;

  /**
   * Socket id of the item.
   */
  @jsonMember(Number)
  socket!: number;

  /**
   * Sort position in the bag, the lesser the position is, the topper it item is shown.
   */
  @jsonMember(Number)
  position!: number;

  /**
   * If the item can be used in Battle.
   */
  @jsonMember(Boolean)
  isBattleUsable!: boolean;

  /**
   * If the item can be used in Map.
   */
  @jsonMember(Boolean)
  isMapUsable!: boolean;

  /**
   * If the item has limited uses (can be thrown).
   */
  @jsonMember(Boolean)
  isLimited!: boolean;

  /**
   * If the item can be held by a Pokemon.
   */
  @jsonMember(Boolean)
  isHoldable!: boolean;

  /**
   * Power of the item when thrown to an other pokemon.
   */
  @jsonMember(Number)
  flingPower!: number;
}
