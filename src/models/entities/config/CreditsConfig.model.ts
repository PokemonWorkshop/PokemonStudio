import PSDKConfig from '@modelEntities/PSDKConfig';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

type Leader = {
  title: string;
  name: string;
};

/**
 * This class represents the credits config.
 */
@jsonObject
export default class CreditsConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Credits';

  /**
   * The class of the credits config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * Get the project title splash (in graphics/titles)
   */
  @jsonMember(String)
  projectSplash!: string;

  /**
   * Get the credits bgm
   */
  @jsonMember(String)
  bgm!: string;

  /**
   * Get the line height of credits
   */
  @jsonMember(Number)
  lineHeight!: number;

  /**
   * Get the speed of the text scrolling (float)
   */
  @jsonMember(Number)
  scrollSpeed!: number;

  /**
   * Get the spacing between a leader text and the center of the screen
   */
  @jsonMember(Number)
  leaderSpacing!: number;

  /**
   * Get the chief project title
   */
  @jsonMember(String)
  chiefProjectTitle!: string;

  /**
   * Get the chief project name
   */
  @jsonMember(String)
  chiefProjectName!: string;

  /**
   * Get the other leaders
   */
  @jsonArrayMember(AnyT)
  leaders!: Leader[];

  /**
   * Get the game credits
   */
  @jsonMember(String)
  gameCredits!: string;

  /**
   * Clone the object
   */
  clone = (): CreditsConfigModel => {
    const newObject = new TypedJSON(CreditsConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as CreditsConfigModel;
  };
}
