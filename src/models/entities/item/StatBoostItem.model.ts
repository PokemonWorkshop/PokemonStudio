import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that boost a specific stat of a Pokemon in Battle.
 */
@jsonObject
export default class StatBoostItemModel extends HealingItemModel {
  static klass = 'StatBoostItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'progress', 'catch'];

  /**
   * The power of the stat to boost.
   */
  @jsonMember(Number)
  count!: number;

  /**
   * The stat too boost.
   */
  @jsonMember(String)
  stat!: string;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: StatBoostItemModel.klass,
    count: 1,
    stat: 'ATK_STAGE',
  });

  /**
   * Clone the object
   */
  clone = (): StatBoostItemModel => {
    const newObject = new TypedJSON(StatBoostItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as StatBoostItemModel;
  };

  /**
   * Get the common ancestor values
   */
  public getCommonAncestorValues(commonAncestorKlass: string) {
    const commonAncestorValues = super.getCommonAncestorValues(commonAncestorKlass);
    delete commonAncestorValues.stat;
    return commonAncestorValues;
  }

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.count = cleanNaNValue(this.count);
  }
}
