import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the devices config.
 */
@jsonObject
export default class DevicesConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Devices';

  /**
   * The class of the devices config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * If the mouse is disabled
   */
  @jsonMember(Boolean)
  isMouseDisabled!: boolean;

  /**
   * The mouse skin to use
   */
  @jsonMember(String, { preserveNull: true })
  mouseSkin?: string;

  /**
   * Clone the object
   */
  clone = (): DevicesConfigModel => {
    const newObject = new TypedJSON(DevicesConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as DevicesConfigModel;
  };
}
