import { jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents an item that is used as a Stone on Pokemon.
 */
@jsonObject
export default class StoneItemModel extends ItemModel {
  static klass = 'StoneItem';
}
