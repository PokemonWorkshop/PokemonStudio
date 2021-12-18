import { jsonArrayMember, jsonObject, TypedJSON } from 'typedjson';
import HealingItemModel from './HealingItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

export const getHealedStatus = (statusList: string[]) => {
  if (statusList.length === 0) return 'NONE';
  if (statusList.length === 1) return statusList[0];

  return 'ALL';
};

/**
 * This class represents an item that heals status.
 */
@jsonObject
export default class StatusHealItemModel extends HealingItemModel {
  static klass = 'StatusHealItem';

  public category: ItemCategory = 'heal';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'catch'];

  /**
   * The list of states the item heals.
   * Possible value: POISONED, PARALYZED, BURN, ASLEEP, FROZEN, CONFUSED, TOXIC, DEATH, FLINCH
   */
  @jsonArrayMember(String)
  statusList!: string[];

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...HealingItemModel.defaultValues(),
    klass: StatusHealItemModel.klass,
    statusList: ['POISONED'],
  });

  /**
   * Clone the object
   */
  clone = (): StatusHealItemModel => {
    const newObject = new TypedJSON(StatusHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as StatusHealItemModel;
  };
}
