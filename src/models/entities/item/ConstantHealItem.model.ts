import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that heals a constant amount of hp.
 */
@jsonObject
export default class ConstantHealItemModel extends HealingItemModel {
  static klass = 'ConstantHealItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * The number of hp the item heals.
   */
  @jsonMember(Number)
  hpCount!: number;

  public getHealValue() {
    return this.hpCount.toString();
  }

  public setHealValue(value: number) {
    this.hpCount = value;
  }

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: ConstantHealItemModel.klass,
    hpCount: 20,
  });

  /**
   * Clone the object
   */
  clone = (): ConstantHealItemModel => {
    const newObject = new TypedJSON(ConstantHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as ConstantHealItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.hpCount = cleanNaNValue(this.hpCount);
  }
}
