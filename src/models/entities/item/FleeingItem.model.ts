import { jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents the kind of item allowing to flee wild battles.
 */
@jsonObject
export default class FleeingItemModel extends ItemModel {
  static klass = 'FleeingItem';
}
