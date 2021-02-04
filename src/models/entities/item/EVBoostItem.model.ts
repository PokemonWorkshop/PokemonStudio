import { jsonObject } from 'typedjson';
import StatBoostItemModel from './StatBoostItem.model';

/**
 * This class represents an item that boost an EV stat of a Pokemon.
 */
@jsonObject
export default class EVBoostItemModel extends StatBoostItemModel {
  static klass = 'EVBoostItem';
}
