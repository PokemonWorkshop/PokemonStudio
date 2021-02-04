import { jsonArrayMember, jsonObject } from 'typedjson';
import RateHealItemModel from './RateHealItem.model';

/**
 * This class represents an item that heals a rate amount of hp and heals status as well.
 */
@jsonObject
export default class StatusRateHealItemModel extends RateHealItemModel {
  static klass = 'StatusRateHealItem';

  /**
   * The list of states the item heals.
   * Possible value: POISONED, PARALYZED, BURN, ASLEEP, FROZEN, CONFUSED, TOXIC, DEATH, FLINCH
   */
  @jsonArrayMember(String)
  statusList!: string[];
}
