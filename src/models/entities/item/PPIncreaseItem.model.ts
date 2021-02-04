import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that increase the PP of a move.
 */
@jsonObject
export default class PPIncreaseItemModel extends HealingItemModel {
  static klass = 'PPIncreaseItem';

  /**
   * Tell if this item sets the PP to the max possible amount.
   */
  @jsonMember(Boolean)
  isMax!: boolean;
}
