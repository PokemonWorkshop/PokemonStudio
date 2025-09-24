import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { ProjectData, State } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';
import type { Node } from '@xyflow/react';
import type { SelectOption as OldSelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import type { SelectOption } from '@ds/Select/types';
import type { MapLinkDialogsRef } from '@components/mapLink/editors/MapLinkEditorOverlay';
import { cloneEntity } from './cloneEntity';
import { createMapLinkV2 } from './entityCreation';

export type MapLinkNodeData = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
  tileSize: number;
  cardinal?: StudioMapLinkCardinal;
  setCardinal?: (cardinal: StudioMapLinkCardinal) => void;
  dialogsRef?: MapLinkDialogsRef;
  index?: number;
};

export type MapLinkNodeType = Node<MapLinkNodeData, 'mainMapLinkNode' | 'mapLinkNode' | 'mapLinkAddMapNode'>;

type MapSize = { width: number; height: number };

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);

export const checkValidMaplink = (mapId: number, state: State) => {
  const maps = Object.values(state.projectData.maps);
  return maps.find((map) => map.id === mapId) ? true : false;
};

const getMapSize = (map: StudioMap): MapSize => {
  if (!map || !map.tileMetadata) return { width: 20, height: 15 };

  const tileMetadata = map.tileMetadata as MapSize;
  const width = tileMetadata.width;
  const height = tileMetadata.height;
  return {
    width,
    height,
  };
};

const getLinkPosition = (cardinal: StudioMapLinkCardinal, mainMapSize: MapSize, mapSize: MapSize, offset: number, tileSize: number) => {
  switch (cardinal) {
    case 'east':
      return { x: mainMapSize.width * tileSize, y: offset * tileSize };
    case 'north':
      return { x: offset * tileSize, y: -mapSize.height * tileSize };
    case 'south':
      return { x: offset * tileSize, y: mainMapSize.height * tileSize };
    case 'west':
      return { x: -mapSize.width * tileSize, y: offset * tileSize };
    default:
      assertUnreachable(cardinal);
  }
  return { x: 0, y: 0 };
};

export const getOffset = (cardinal: StudioMapLinkCardinal, position: Node['position'], tileSize: number) => {
  switch (cardinal) {
    case 'east':
    case 'west':
      return position.y / tileSize;
    case 'north':
    case 'south':
      return position.x / tileSize;
    default:
      assertUnreachable(cardinal);
  }
  return 0;
};

const buildLinksByCardinal = (
  mapLink: StudioMapLink,
  cardinal: StudioMapLinkCardinal,
  maps: Record<number, StudioMap>,
  tileSize: number
): MapLinkNodeType[] => {
  const links = getLinksFromMapLink(mapLink, cardinal);
  const mainMapSize = getMapSize(maps[mapLink.mapId]);
  return links.map(({ mapId, offset }, index) => {
    const mapSize = getMapSize(maps[mapId]);
    return {
      id: `map-link-node-${cardinal}-${index}`,
      position: getLinkPosition(cardinal, mainMapSize, mapSize, offset, tileSize),
      type: 'mapLinkNode',
      data: { mapLink, maps, cardinal, index, tileSize },
    };
  });
};

export const initMainMapLinkNode = (
  mapLink: StudioMapLink,
  maps: Record<number, StudioMap>,
  tileSize: number,
  setCardinal: (cardinal: StudioMapLinkCardinal) => void,
  dialogsRef?: MapLinkDialogsRef
): MapLinkNodeType => ({
  id: 'main-map-link-node',
  position: { x: 0, y: 0 },
  type: 'mainMapLinkNode',
  data: { mapLink, maps, tileSize, setCardinal, dialogsRef },
  draggable: false,
  className: 'nopan',
  zIndex: 1,
});

export const buildLinks = (mapLink: StudioMapLink, maps: Record<number, StudioMap>, tileSize: number): MapLinkNodeType[] => {
  return [
    ...buildLinksByCardinal(mapLink, 'east', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'north', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'south', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'west', maps, tileSize),
  ];
};

export const mapLinkMapOptions = (
  defaultMapOptions: OldSelectOption[],
  maps: ProjectData['maps'],
  zones: ProjectData['zones']
): SelectOption<string>[] => {
  const validMaps = getValidMaps(zones);
  return defaultMapOptions
    .reduce<SelectOption<string>[]>((prev, mapOption) => {
      const { value, label } = mapOption;
      const id = maps[value]?.id;
      if (id === undefined) return prev;

      return [...prev, { value: id.toString(), label }];
    }, [])
    .filter(({ value }) => validMaps.includes(Number(value)));
};

/**
 * Create a maplink if does not exist. If the maplink exists, all the links are cleaned.
 */
export const createMapLinkFromMainMapId = (mapLinks: ProjectData['mapLinks'], mainMapId: number) => {
  const mapLink = Object.values(mapLinks).find((mapLink) => mapLink.mapId === mainMapId);
  if (mapLink) {
    const mapLinkEdited = cloneEntity(mapLink);
    mapLinkEdited.northMaps = [];
    mapLinkEdited.eastMaps = [];
    mapLinkEdited.southMaps = [];
    mapLinkEdited.westMaps = [];
    return mapLinkEdited;
  }
  return createMapLinkV2(mapLinks, mainMapId);
};

export const getMapSizeStyle = (map: StudioMap, tileSize: number) => {
  const size = getMapSize(map);
  return { width: size.width * tileSize, height: size.height * tileSize };
};
