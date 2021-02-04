import { jsonMember, jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents the items that repels Pokemon for a certain amount of steps.
 */
@jsonObject
export default class RepelItemModel extends ItemModel {
  static klass = 'RepelItem';

  /**
   * The number of steps this item repels.
   */
  @jsonMember(Number)
  repelCount!: number;
}
