import { jsonMember, jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This class represents the kind of item that calls an event in map.
 */
@jsonObject
export default class EventItemModel extends ItemModel {
  static klass = 'EventItem';

  /**
   * The ID of the event to call.
   */
  @jsonMember(Number)
  eventId!: number;
}
