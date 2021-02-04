import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that increase the level of the Pokemon.
 */
@jsonObject
export default class LevelIncreaseItemModel extends HealingItemModel {
  static klass = 'LevelIncreaseItem';

  /**
   * The number of level this item increase.
   */
  @jsonMember(Number)
  levelCount!: number;
}
