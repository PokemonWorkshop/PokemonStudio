import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { getText, setText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

// 0 = None, 1 = Rain, 2 = Sun/Zenith, 3 = Sandstorm, 4 = Hail, 5 = Foggy
export const WeatherCategories = [0, 1, 2, 3, 4, 5] as const;

type MapCoordinate = {
  x: number | null;
  y: number | null;
};

/**
 * This class represents a zone.
 */
@jsonObject
export default class ZoneModel implements PSDKEntity {
  static klass = 'Zone';

  /**
   * The class of the zone.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the zone.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the zone.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * List of MAP ID the zone is related to.
   */
  @jsonArrayMember(Number)
  maps!: number[];

  /**
   * ID of the worldmap to display when in this zone.
   */
  @jsonArrayMember(AnyT, { preserveNull: true })
  worldmaps!: number[] | null[];

  /**
   * Number at the end of the Panel file (Graphics/Windowskins/Panel_#panel_id).
   */
  @jsonMember(Number)
  panelId!: number;

  /**
   * Position of the Warp when using Dig, Teleport or Fly.
   */
  @jsonMember(AnyT, { preserveNull: true })
  warp!: MapCoordinate;

  /**
   * Position of the player on the World Map.
   */
  @jsonMember(AnyT, { preserveNull: true })
  position!: MapCoordinate;

  /**
   * If the player can use fly in this zone (otherwise he can use Dig).
   */
  @jsonMember(Boolean)
  isFlyAllowed!: boolean;

  /**
   * If its not allowed to use fly, dig or teleport in this zone.
   */
  @jsonMember(Boolean)
  isWarpDisallowed!: boolean;

  /**
   * ID of the weather in the zone.
   */
  @jsonMember(Number, { preserveNull: true })
  forcedWeather!: number | null;

  /**
   * The dbSymbols of groups of Wild Pokemon.
   */
  @jsonArrayMember(String)
  wildGroups!: string[];

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the description of the zone
   * @returns The description of the zone
   */
  descr = () => {
    if (!this.projectText) return `description of zone ${this.id}`;
    return getText(this.projectText, 64, this.id);
  };

  /**
   * Set the description of the zone
   */
  setDescr = (descr: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 64, this.id, descr);
  };

  /**
   * Get the name of the zone
   * @returns The name of the zone
   */
  name = () => {
    if (!this.projectText) return `name of zone ${this.id}`;
    return getText(this.projectText, 10, this.id);
  };

  /**
   * Set the name of the zone
   * @param name
   * @returns
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 10, this.id, name);
  };

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: ZoneModel.klass,
    id: 0,
    dbSymbol: 'zone_0',
    maps: [],
    worldmaps: [],
    panelId: 0,
    warp: { x: null, y: null },
    position: { x: null, y: null },
    isFlyAllowed: false,
    isWarpDisallowed: false,
    forcedWeather: null,
    wildGroups: [],
  });

  /**
   * Clone the object
   */
  clone = (): ZoneModel => {
    const newObject = new TypedJSON(ZoneModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as ZoneModel;
  };

  /**
   * Create a new zone with default values
   * @param allZones The project data containing the zones
   * @returns The new zone
   */
  static createZone = (allZones: ProjectData['zones']): ZoneModel => {
    const newZone = new ZoneModel();
    Object.assign(newZone, ZoneModel.defaultValues());
    newZone.id = findFirstAvailableId(allZones, 0);
    newZone.dbSymbol = `zone_${newZone.id}`;
    return newZone;
  };

  /**
   * Replace NaN value by null
   * @param value The coordinate
   * @returns The coordinate without NaN
   */
  static cleanCoordinate = (value: number | null) => {
    if (value === null) return null;

    return isNaN(value) ? null : value;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.panelId = cleanNaNValue(this.panelId);
    this.position.x = ZoneModel.cleanCoordinate(this.position.x);
    this.position.y = ZoneModel.cleanCoordinate(this.position.y);
    this.warp.x = ZoneModel.cleanCoordinate(this.warp.x);
    this.warp.y = ZoneModel.cleanCoordinate(this.warp.y);
  };
}
