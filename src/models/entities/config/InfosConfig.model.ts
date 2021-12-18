import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the infos config.
 */
@jsonObject
export default class InfosConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Infos';

  /**
   * The class of the infos config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The game title
   */
  @jsonMember(String)
  gameTitle!: string;

  /**
   * Game version
   */
  @jsonMember(Number)
  gameVersion!: number;

  /**
   * Clone the object
   */
  clone = (): InfosConfigModel => {
    const newObject = new TypedJSON(InfosConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as InfosConfigModel;
  };
}
