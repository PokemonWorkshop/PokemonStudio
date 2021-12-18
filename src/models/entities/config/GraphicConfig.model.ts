import PSDKConfig from '@modelEntities/PSDKConfig';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the graphic config.
 */
@jsonObject
export default class GraphicConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Graphic';

  /**
   * The class of the graphic config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * If textures are smooth
   */
  @jsonMember(Boolean)
  isSmoothTexture!: boolean;

  /**
   * If the game runs in VSYNC
   */
  @jsonMember(Boolean)
  isVsyncEnabled!: boolean;

  /**
   * Clone the object
   */
  clone = (): GraphicConfigModel => {
    const newObject = new TypedJSON(GraphicConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as GraphicConfigModel;
  };
}
