import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that heals a certain amount of PP of a single move
 */
@jsonObject
export default class PPHealItemModel extends HealingItemModel {
  static klass = 'PPHealItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * The number of PP of the move that gets healed.
   */
  @jsonMember(Number)
  ppCount!: number;

  public getHealValue() {
    return this.ppCount.toString();
  }

  public setHealValue(value: number) {
    this.ppCount = value;
  }

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: PPHealItemModel.klass,
    ppCount: 10,
  });

  /**
   * Clone the object
   */
  clone = (): PPHealItemModel => {
    const newObject = new TypedJSON(PPHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as PPHealItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.ppCount = cleanNaNValue(this.ppCount);
  }
}
