import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that increase the level of the Pokemon.
 */
@jsonObject
export default class LevelIncreaseItemModel extends HealingItemModel {
  static klass = 'LevelIncreaseItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'catch'];

  /**
   * The number of level this item increase.
   */
  @jsonMember(Number)
  levelCount!: number;

  public progressType = 'LEVEL_PROGRESS';

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: LevelIncreaseItemModel.klass,
    levelCount: 1,
  });

  /**
   * Clone the object
   */
  clone = (): LevelIncreaseItemModel => {
    const newObject = new TypedJSON(LevelIncreaseItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as LevelIncreaseItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.levelCount = cleanNaNValue(this.levelCount);
  }
}
