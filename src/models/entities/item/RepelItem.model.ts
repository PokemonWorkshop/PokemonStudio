import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents the items that repels Pokemon for a certain amount of steps.
 */
@jsonObject
export default class RepelItemModel extends ItemModel {
  static klass = 'RepelItem';

  public category: ItemCategory = 'repel';

  public lockedEditors: ItemEditors[] = ['battle', 'progress', 'heal', 'catch', 'berries', 'cooking'];

  /**
   * The number of steps this item repels.
   */
  @jsonMember(Number)
  repelCount!: number;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: RepelItemModel.klass,
    repelCount: 0,
  });

  /**
   * Clone the object
   */
  clone = (): RepelItemModel => {
    const newObject = new TypedJSON(RepelItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as RepelItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.repelCount = cleanNaNValue(this.repelCount);
  }
}
