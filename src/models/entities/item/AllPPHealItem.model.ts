import { jsonObject } from 'typedjson';
import PPHealItemModel from './PPHealItem.model';

/**
 * This class represents an item that heals a certain amount of PP of all moves
 */
@jsonObject
export default class AllPPHealItemModel extends PPHealItemModel {
  static klass = 'AllPPHealItem';
}
