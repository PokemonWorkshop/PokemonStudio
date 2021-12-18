import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This class represents the kind of item that calls an event in map.
 */
@jsonObject
export default class EventItemModel extends ItemModel {
  static klass = 'EventItem';

  public category: ItemCategory = 'event';

  public lockedEditors: ItemEditors[] = ['battle', 'progress', 'catch', 'heal', 'berries', 'cooking'];

  /**
   * The ID of the event to call.
   */
  @jsonMember(Number)
  eventId!: number;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: EventItemModel.klass,
    eventId: 0,
  });

  /**
   * Clone the object
   */
  clone = (): EventItemModel => {
    const newObject = new TypedJSON(EventItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as EventItemModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.eventId = cleanNaNValue(this.eventId);
  }
}
