import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that increase the PP of a move.
 */
@jsonObject
export default class PPIncreaseItemModel extends HealingItemModel {
  static klass = 'PPIncreaseItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * Tell if this item sets the PP to the max possible amount.
   */
  @jsonMember(Boolean)
  isMax!: boolean;

  public getHealValue() {
    return this.isMax ? 'Max' : '+20%';
  }

  public setHealValue(value: number) {
    this.isMax = value !== 0;
  }

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: PPIncreaseItemModel.klass,
    isMax: false,
  });

  /**
   * Clone the object
   */
  clone = (): PPIncreaseItemModel => {
    const newObject = new TypedJSON(PPIncreaseItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as PPIncreaseItemModel;
  };
}
