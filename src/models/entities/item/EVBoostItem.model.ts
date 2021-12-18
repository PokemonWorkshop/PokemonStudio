import { jsonObject, TypedJSON } from 'typedjson';
import { ItemCategory, ItemEditors } from './Item.model';
import StatBoostItemModel from './StatBoostItem.model';

/**
 * This class represents an item that boost an EV stat of a Pokemon.
 */
@jsonObject
export default class EVBoostItemModel extends StatBoostItemModel {
  static klass = 'EVBoostItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'catch'];

  public progressType = 'EV_PROGRESS';

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...StatBoostItemModel.defaultValues(),
    klass: EVBoostItemModel.klass,
    stat: 'ATK',
  });

  /**
   * Clone the object
   */
  clone = (): EVBoostItemModel => {
    const newObject = new TypedJSON(EVBoostItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as EVBoostItemModel;
  };
}
