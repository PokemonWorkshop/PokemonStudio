import { jsonArrayMember, jsonObject, TypedJSON } from 'typedjson';
import { ItemCategory, ItemEditors } from './Item.model';
import RateHealItemModel from './RateHealItem.model';

/**
 * This class represents an item that heals a rate amount of hp and heals status as well.
 */
@jsonObject
export default class StatusRateHealItemModel extends RateHealItemModel {
  static klass = 'StatusRateHealItem';

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
    ...RateHealItemModel.defaultValues(),
    klass: StatusRateHealItemModel.klass,
    statusList: ['POISONED'],
  });

  /**
   * Clone the object
   */
  clone = (): StatusRateHealItemModel => {
    const newObject = new TypedJSON(StatusRateHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as StatusRateHealItemModel;
  };
}
