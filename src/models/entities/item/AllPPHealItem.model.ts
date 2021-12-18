import { jsonObject, TypedJSON } from 'typedjson';
import { ItemCategory, ItemEditors } from './Item.model';
import PPHealItemModel from './PPHealItem.model';

/**
 * This class represents an item that heals a certain amount of PP of all moves
 */
@jsonObject
export default class AllPPHealItemModel extends PPHealItemModel {
  static klass = 'AllPPHealItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...PPHealItemModel.defaultValues(),
    klass: AllPPHealItemModel.klass,
  });

  /**
   * Clone the object
   */
  clone = (): AllPPHealItemModel => {
    const newObject = new TypedJSON(AllPPHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as AllPPHealItemModel;
  };
}
