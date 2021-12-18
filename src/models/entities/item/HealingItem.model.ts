import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents all items that heals Pokemon.
 */
@jsonObject
export default class HealingItemModel extends ItemModel {
  static klass = 'HealingItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'progress', 'catch', 'battle'];

  /**
   * The loyalty malus.
   */
  @jsonMember(Number)
  loyaltyMalus!: number;

  /**
   * Heal value for the UI
   */
  public getHealValue() {
    return '---';
  }

  public setHealValue(_value: number) {}

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: HealingItemModel.klass,
    loyaltyMalus: 0,
  });

  /**
   * Clone the object
   */
  clone = (): HealingItemModel => {
    const newObject = new TypedJSON(HealingItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as HealingItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.loyaltyMalus = cleanNaNValue(this.loyaltyMalus);
  }
}
