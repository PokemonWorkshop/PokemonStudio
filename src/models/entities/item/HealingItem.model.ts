import { jsonMember, jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents all items that heals Pokemon.
 */
@jsonObject
export default class HealingItemModel extends ItemModel {
  static klass = 'HealingItem';

  /**
   * The loyalty malus.
   */
  @jsonMember(Number)
  loyaltyMalus!: number;
}
