import { jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents the kind of item allowing to flee wild battles.
 */
@jsonObject
export default class FleeingItemModel extends ItemModel {
  static klass = 'FleeingItem';

  public category: ItemCategory = 'fleeing';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'];

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: FleeingItemModel.klass,
  });

  /**
   * Clone the object
   */
  clone = (): FleeingItemModel => {
    const newObject = new TypedJSON(FleeingItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as FleeingItemModel;
  };
}
