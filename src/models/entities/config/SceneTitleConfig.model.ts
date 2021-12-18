import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the scene title config.
 */
@jsonObject
export default class SceneTitleConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::SceneTitle';

  /**
   * The class of the scene title config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * Get the intro movie map id (0 = No intro movie)
   */
  @jsonMember(Number)
  introMovieMapId!: number;

  /**
   * Get the name of the bgm to play
   */
  @jsonMember(String)
  bgmName!: string;

  /**
   * Get the duration of the title music before it restarts (duration in pcm samples)
   */
  @jsonMember(Number)
  bgmDuration!: number;

  /**
   * Get the information if the language selection is enabled or not
   */
  @jsonMember(Boolean)
  isLanguageSelectionEnabled!: boolean;

  /**
   * Get the additional splash played after the PSDK splash
   */
  @jsonArrayMember(String)
  additionalSplashes!: string[];

  /**
   * Get the duration the controls has to wait before showing (float)
   */
  @jsonMember(Number)
  controlWaitTime!: number;

  /**
   * Clone the object
   */
  clone = (): SceneTitleConfigModel => {
    const newObject = new TypedJSON(SceneTitleConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as SceneTitleConfigModel;
  };
}
