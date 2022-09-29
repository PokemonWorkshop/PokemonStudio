import PSDKConfig from '@modelEntities/PSDKConfig';
import path from 'path';
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
  mouseSkin!: string | null;

  /**
   * Clone the object
   */
  clone = (): DevicesConfigModel => {
    const newObject = new TypedJSON(DevicesConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as DevicesConfigModel;
  };

  /**
   * Get the url of the mouse skin
   * @param projectPath The project path
   * @returns The url of the mouse skin
   */
  mouseSkinUrl = (projectPath: string) => {
    return path.join(projectPath, `graphics/windowskins/${this.mouseSkin}.png`);
  };
}
