import { jsonMember, jsonObject } from 'typedjson';
import HealingItemModel from './HealingItem.model';

/**
 * This class represents an item that boost a specific stat of a Pokemon in Battle.
 */
@jsonObject
export default class StatBoostItemModel extends HealingItemModel {
  static klass = 'StatBoostItem';

  /**
   * The power of the stat to boost.
   */
  @jsonMember(Number)
  count!: number;

  /**
   * The stat too boost.
   */
  @jsonMember(String)
  stat!: string;
}
