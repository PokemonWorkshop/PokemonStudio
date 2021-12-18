import { jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that is used as a Stone on Pokemon.
 */
@jsonObject
export default class StoneItemModel extends ItemModel {
  static klass = 'StoneItem';

  public category: ItemCategory = 'stone';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'];

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: StoneItemModel.klass,
  });

  /**
   * Clone the object
   */
  clone = (): StoneItemModel => {
    const newObject = new TypedJSON(StoneItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as StoneItemModel;
  };
}
