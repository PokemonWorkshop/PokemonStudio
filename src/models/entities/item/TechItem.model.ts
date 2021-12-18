import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents the kind of item that allows the Pokemon to learn a move.
 */
@jsonObject
export default class TechItemModel extends ItemModel {
  static klass = 'TechItem';

  public category: ItemCategory = 'tech';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'];

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

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: TechItemModel.klass,
    isHm: false,
    move: '__undef__',
  });

  /**
   * Clone the object
   */
  clone = (): TechItemModel => {
    const newObject = new TypedJSON(TechItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as TechItemModel;
  };
}
