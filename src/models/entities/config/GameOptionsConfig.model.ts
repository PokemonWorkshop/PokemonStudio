import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the game options config.
 */
@jsonObject
export default class GameOptionsConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::GameOptions';

  /**
   * The class of the game options config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * List of the key for the game options
   */
  @jsonArrayMember(String)
  order!: string[];

  /**
   * Clone the object
   */
  clone = (): GameOptionsConfigModel => {
    const newObject = new TypedJSON(GameOptionsConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as GameOptionsConfigModel;
  };

  /**
   * Add a key in order array
   * @param key The new key
   */
  addKeyOfOrder = (key: string) => {
    this.order.push(key);
  };

  /**
   * Remove a key of order array
   * @param key The key to remove
   */
  removeKeyOfOrder = (key: string) => {
    const index = this.order.findIndex((k) => k === key);
    if (index === -1) return;

    this.order.splice(index, 1);
  };
}
