import { jsonArrayMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that heals status.
 */
@jsonObject
export default class StatusHealItemModel extends HealingItemModel {
  static klass = 'StatusHealItem';

  /**
   * The list of states the item heals.
   * Possible value: POISONED, PARALYZED, BURN, ASLEEP, FROZEN, CONFUSED, TOXIC, DEATH, FLINCH
   */
  @jsonArrayMember(String)
  statusList!: string[];
}
