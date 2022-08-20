import PSDKConfig from '@modelEntities/PSDKConfig';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the save config.
 */
@jsonObject
export default class SaveConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Save';

  /**
   * The class of the save config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * Number of save the player can have (0 = infinite)
   */
  @jsonMember(Number)
  maximumSave!: number;

  /**
   * Get the save key (preventing other fangames to read the save if changed)
   */
  @jsonMember(Number)
  saveKey!: number;

  /**
   * Get the header of the save file (preventing other fangames to read the save if changed)
   */
  @jsonMember(String)
  saveHeader!: string;

  /**
   * Get the base filename of the save
   */
  @jsonMember(String)
  baseFilename!: string;

  /**
   * Tell if the player is allowed to save over another save
   */
  @jsonMember(Boolean)
  isCanSaveOnAnySave!: boolean;

  /**
   * Clone the object
   */
  clone = (): SaveConfigModel => {
    const newObject = new TypedJSON(SaveConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as SaveConfigModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.maximumSave = cleanNaNValue(this.maximumSave);
    this.saveKey = cleanNaNValue(this.saveKey);
  };
}
