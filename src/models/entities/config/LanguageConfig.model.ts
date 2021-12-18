import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the language config.
 */
@jsonObject
export default class LanguageConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Language';

  /**
   * The class of the language config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * Default language of the game
   */
  @jsonMember(String)
  defaultLanguage!: string;

  /**
   * List of language the player can choose
   */
  @jsonArrayMember(String)
  choosableLanguageCode!: string[];

  /**
   * List of language the player can choose (names)
   */
  @jsonArrayMember(String)
  choosableLanguageTexts!: string[];

  /**
   * Clone the object
   */
  clone = (): LanguageConfigModel => {
    const newObject = new TypedJSON(LanguageConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as LanguageConfigModel;
  };
}
