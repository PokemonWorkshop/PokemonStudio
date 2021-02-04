import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that heals a constant amount of hp.
 */
@jsonObject
export default class ConstantHealItemModel extends HealingItemModel {
  static klass = 'ConstantHealItem';

  /**
   * The number of hp the item heals.
   */
  @jsonMember(Number)
  hpCount!: number;
}
