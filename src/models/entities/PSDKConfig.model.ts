import { jsonMember, jsonObject } from 'typedjson';

/**
 * This class represents the model of the PSDK Config.
 */
@jsonObject
export default class PSDKConfigModel {
  /**
   * The game title of the PSDK project
   */
  @jsonMember(String)
  gameTitle!: string;
}
