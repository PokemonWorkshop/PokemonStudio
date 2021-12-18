import { jsonArrayMember, jsonObject, TypedJSON } from 'typedjson';
import ConstantHealItemModel from './ConstantHealItem.model';
import { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents an item that heals a rate amount of hp and heals status as well.
 */
@jsonObject
export default class StatusConstantHealItemModel extends ConstantHealItemModel {
  static klass = 'StatusConstantHealItem';

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
    ...ConstantHealItemModel.defaultValues(),
    klass: ConstantHealItemModel.klass,
    statusList: ['POISONED'],
  });

  /**
   * Clone the object
   */
  clone = (): StatusConstantHealItemModel => {
    const newObject = new TypedJSON(StatusConstantHealItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as StatusConstantHealItemModel;
  };
}
