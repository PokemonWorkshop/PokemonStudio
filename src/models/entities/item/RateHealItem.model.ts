import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that heals a rate (0~100% using a number between 0 & 1) of hp.
 */
@jsonObject
export default class RateHealItemModel extends HealingItemModel {
  static klass = 'RateHealItem';

  /**
   * The rate of hp this item can heal.
   */
  @jsonMember(Number)
  hpRate!: number;
}
