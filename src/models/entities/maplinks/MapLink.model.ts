import PSDKEntity from '@modelEntities/PSDKEntity';
import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

export type MapLinkLink = {
  mapId: number;
  offset: number;
};

export const CardinalCategory = ['north', 'east', 'south', 'west'] as const;
export type Cardinal = typeof CardinalCategory[number];

/**
 * This class represents the model of a map link.
 */
@jsonObject
export default class MapLinkModel implements PSDKEntity {
  static klass = 'MapLink';

  /**
   * The class of the map link.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the map link.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the map link.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The map id of the current map.
   */
  @jsonMember(Number)
  mapId!: number;

  /**
   * The map linked to the north
   */
  @jsonArrayMember(AnyT)
  northMaps!: MapLinkLink[];

  /**
   * The map linked to the east
   */
  @jsonArrayMember(AnyT)
  eastMaps!: MapLinkLink[];

  /**
   * The map linked to the south
   */
  @jsonArrayMember(AnyT)
  southMaps!: MapLinkLink[];

  /**
   * The map linked to the west
   */
  @jsonArrayMember(AnyT)
  westMaps!: MapLinkLink[];

  /**
   * Text of the project.
   */
  projectText?: TextsWithLanguageConfig;

  /**
   * Get the name of the map link (a maplink entity has not a name, so this method returns the dbSymbol)
   * @returns The name of the map link
   */
  name = () => {
    return this.dbSymbol;
  };

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: MapLinkModel.klass,
    id: -1,
    dbSymbol: 'new_map_link',
    mapId: -1,
    northMaps: [],
    eastMaps: [],
    southMaps: [],
    westMaps: [],
  });

  /**
   * Clone the object
   */
  clone = (): MapLinkModel => {
    const newObject = new TypedJSON(MapLinkModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as MapLinkModel;
  };

  /**
   * Create a new map links with default values
   * @param allMapLinks The project data containing the map links
   * @returns The new map link
   */
  static createMapLink = (allMapLinks: ProjectData['mapLinks'], mapId: number): MapLinkModel => {
    const newMapLink = new MapLinkModel();
    Object.assign(newMapLink, MapLinkModel.defaultValues());
    newMapLink.id = findFirstAvailableId(allMapLinks, 0);
    newMapLink.mapId = mapId;
    newMapLink.dbSymbol = `maplink_${newMapLink.id}`;
    return newMapLink;
  };
}

export const getLinksFromMapLink = (mapLink: MapLinkModel, cardinal: Cardinal): MapLinkLink[] => {
  switch (cardinal) {
    case 'north':
      return mapLink.northMaps;
    case 'east':
      return mapLink.eastMaps;
    case 'south':
      return mapLink.southMaps;
    case 'west':
      return mapLink.westMaps;
  }
};

export const setLinksFromMapLink = (mapLink: MapLinkModel, links: MapLinkLink[], cardinal: Cardinal): void => {
  switch (cardinal) {
    case 'north':
      mapLink.northMaps = links.filter(Boolean);
      break;
    case 'east':
      mapLink.eastMaps = links.filter(Boolean);
      break;
    case 'south':
      mapLink.southMaps = links.filter(Boolean);
      break;
    case 'west':
      mapLink.westMaps = links.filter(Boolean);
      break;
  }
};
