import { jsonMember, jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents the kind of item that allows the Pokemon to learn a move.
 */
@jsonObject
export default class TechItemModel extends ItemModel {
  static klass = 'TechItem';

  /**
   * If the item is a Hidden Move or not.
   */
  @jsonMember(Boolean)
  isHm!: boolean;

  /**
   * The db_symbol of the move it teach.
   */
  @jsonMember(String)
  move!: string;
}
