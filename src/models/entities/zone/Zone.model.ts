import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import Encounter from '../Encounter.model';
import PSDKEntity from '../PSDKEntity';

/**
 * This interface represents a wild group.
 */
interface WildGroup {
  /**
   * The system_tag zone in which the Roaming Pokemon will appear.
   */
  systemTag: string;

  /**
   * If the battle is the double battle.
   */
  isDoubleBattle: boolean;

  /**
   * If the battle is the horde battle.
   */
  isHordeBattle: boolean;

  /**
   * Custom condition.
   */
  customCondition: any;

  /**
   * The list of the wilds encounters
   */
  encounters: Encounter[];
}

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
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

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
  pannelId!: number;

  /**
   * X position of the Warp when using Dig, Teleport or Fly.
   */
  @jsonMember(Number, { preserveNull: true })
  warpX!: number | null;

  /**
   * Y position of the Warp when using Dig, Teleport or Fly.
   */
  @jsonMember(Number, { preserveNull: true })
  warpY!: number | null;

  /**
   * X position of the player on the World Map.
   */
  @jsonMember(Number, { preserveNull: true })
  positionX!: number | null;

  /**
   * Y position of the player on the World Map.
   */
  @jsonMember(Number, { preserveNull: true })
  positionY!: number | null;

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
   * Unused.
   */
  @jsonArrayMember(AnyT)
  subZones!: any[];

  /**
   * The groups of Wild Pokemon.
   */
  @jsonArrayMember(AnyT)
  wildGroups!: WildGroup[];
}
