import PSDKConfig from '@modelEntities/PSDKConfig';
import { cleanNaNValue } from '@utils/cleanNaNValue';
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

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.gameResolution.x = cleanNaNValue(this.gameResolution.x, 320);
    this.gameResolution.y = cleanNaNValue(this.gameResolution.y, 240);
    this.windowScale = cleanNaNValue(this.windowScale, 1);
    this.tilemapSettings.tilemapSize.x = cleanNaNValue(this.tilemapSettings.tilemapSize.x, 22);
    this.tilemapSettings.tilemapSize.y = cleanNaNValue(this.tilemapSettings.tilemapSize.y, 17);
    this.tilemapSettings.autotileIdleFrameCount = cleanNaNValue(this.tilemapSettings.autotileIdleFrameCount, 1);
    this.tilemapSettings.characterTileZoom = cleanNaNValue(this.tilemapSettings.characterTileZoom, 0.5);
    this.tilemapSettings.characterSpriteZoom = cleanNaNValue(this.tilemapSettings.characterSpriteZoom, 0.5);
    this.tilemapSettings.center.x = cleanNaNValue(this.tilemapSettings.center.x);
    this.tilemapSettings.center.y = cleanNaNValue(this.tilemapSettings.center.y);
    this.tilemapSettings.maplinkerOffset.x = cleanNaNValue(this.tilemapSettings.maplinkerOffset.x);
    this.tilemapSettings.maplinkerOffset.y = cleanNaNValue(this.tilemapSettings.maplinkerOffset.y);
  };
}
