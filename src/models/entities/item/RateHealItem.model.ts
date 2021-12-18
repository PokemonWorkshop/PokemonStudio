import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that heals a rate (0~100% using a number between 0 & 1) of hp.
 */
@jsonObject
export default class RateHealItemModel extends HealingItemModel {
  static klass = 'RateHealItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * The rate of hp this item can heal.
   */
  @jsonMember(Number)
  hpRate!: number;

  public getHealValue() {
    return `${(this.hpRate * 100).toFixed(0)}%`;
  }

  public setHealValue(value: number) {
    this.hpRate = value / 100;
  }

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: RateHealItemModel.klass,
    hpRate: 0.5,
  });

  /**
   * Clone the object
   */
  clone = (): RateHealItemModel => {
    const newObject = new TypedJSON(RateHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as RateHealItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.hpRate = cleanNaNValue(this.hpRate);
  }
}
