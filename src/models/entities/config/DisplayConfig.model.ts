import PSDKConfig from '@modelEntities/PSDKConfig';
import { AnyT, jsonMember, jsonObject, TypedJSON } from 'typedjson';

type XY = {
  x: number;
  y: number;
};

type TilemapConfig = {
  /**
   * Full constant path of the tilemap class (from Object)
   */
  tilemapClass: string;

  /**
   * Number of tile in x and y to properly show the tilemap
   */
  tilemapSize: XY;

  /**
   * Number of frame an autotile wait before being refreshed
   */
  autotileIdleFrameCount: number;

  /**
   * Zoom of tiles in sprite character (float)
   */
  characterTileZoom: number;

  /**
   * Zoom of sprite character (float)
   */
  characterSpriteZoom: number;

  /**
   * Player center values
   */
  center: XY;

  /**
   * Number of tile in x and y to make a proper map transition with map linker
   */
  maplinkerOffset: XY;

  /**
   * If the game use old maplinker method
   */
  isOldMaplinker: boolean;
};

/**
 * This class represents the display config.
 */
@jsonObject
export default class DisplayConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Display';

  /**
   * The class of the display config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The game resolution
   */
  @jsonMember(AnyT)
  gameResolution!: XY;

  /**
   * The window scale
   */
  @jsonMember(Number)
  windowScale!: number;

  /**
   * If the game runs in fullscreen
   */
  @jsonMember(Boolean)
  isFullscreen!: boolean;

  /**
   * If the player is always centered
   */
  @jsonMember(Boolean)
  isPlayerAlwaysCentered!: boolean;

  /**
   * Tilemap configurations
   */
  @jsonMember(AnyT)
  tilemapSettings!: TilemapConfig;

  /**
   * Clone the object
   */
  clone = (): DisplayConfigModel => {
    const newObject = new TypedJSON(DisplayConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as DisplayConfigModel;
  };
}
