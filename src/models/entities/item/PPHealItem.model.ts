import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that heals a certain amount of PP of a single move
 */
@jsonObject
export default class PPHealItemModel extends HealingItemModel {
  static klass = 'PPHealItem';

  /**
   * The number of PP of the move that gets healed.
   */
  @jsonMember(Number)
  ppCount!: number;
}
