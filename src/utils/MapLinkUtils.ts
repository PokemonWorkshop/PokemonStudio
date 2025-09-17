import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, MAP_LINK_CARDINAL_LIST, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { ProjectData, State } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';
import type { Node } from '@xyflow/react';
import type { SelectOption as OldSelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import type { SelectOption } from '@ds/Select/types';
import type { MapLinkDialogsRef } from '@components/mapLink/editors/MapLinkEditorOverlay';

export type MapLinkNodeData = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
  cardinal?: StudioMapLinkCardinal;
  dialogsRef?: MapLinkDialogsRef;
  index?: number;
};

export type MapLinkNodeType = Node<MapLinkNodeData, 'mainMapLinkNode' | 'mapLinkNode' | 'mapLinkAddMapNode'>;

type MapSize = { width: number; height: number };

// The values are used with tileSize, so we don't count in pixels but in tiles
// Example: If tileSize = 32 and the width 2, the real width is 64px.
const ADD_MAP_NODE_SIZE = { width: 3, height: 3 };
const ADD_MAP_NODE_OFFSET = 4;

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);

export const checkValidMaplink = (mapId: number, state: State) => {
  const maps = Object.values(state.projectData.maps);
  return maps.find((map) => map.id === mapId) ? true : false;
};

const getMapSize = (map: StudioMap): MapSize => {
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

const getAddMapPosition = (cardinal: StudioMapLinkCardinal, mainMapSize: MapSize, tileSize: number) => {
  switch (cardinal) {
    case 'east':
      return { x: (mainMapSize.width + ADD_MAP_NODE_OFFSET) * tileSize, y: (mainMapSize.height / 2 - ADD_MAP_NODE_SIZE.height / 2) * tileSize };
    case 'north':
      return { x: (mainMapSize.width / 2 - ADD_MAP_NODE_SIZE.width / 2) * tileSize, y: -(ADD_MAP_NODE_OFFSET + ADD_MAP_NODE_SIZE.height) * tileSize };
    case 'south':
      return { x: (mainMapSize.width / 2 - ADD_MAP_NODE_SIZE.width / 2) * tileSize, y: (mainMapSize.height + ADD_MAP_NODE_OFFSET) * tileSize };
    case 'west':
      return {
        x: -(ADD_MAP_NODE_OFFSET + ADD_MAP_NODE_SIZE.width) * tileSize,
        y: (mainMapSize.height / 2 - ADD_MAP_NODE_SIZE.height / 2) * tileSize,
      };
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
      data: { mapLink, maps, cardinal, index },
    };
  });
};

const buildAddMapByCardinal = (
  mapLink: StudioMapLink,
  cardinal: StudioMapLinkCardinal,
  maps: Record<number, StudioMap>,
  tileSize: number,
  dialogsRef?: MapLinkDialogsRef
): MapLinkNodeType => {
  const mainMapSize = getMapSize(maps[mapLink.mapId]);
  return {
    id: `map-link-add-map-node-${cardinal}`,
    position: getAddMapPosition(cardinal, mainMapSize, tileSize),
    type: 'mapLinkAddMapNode',
    data: { mapLink, maps, dialogsRef },
    draggable: false,
    className: 'nopan',
    hidden: true,
    zIndex: 1,
  };
};

export const initMainMapLinkNode = (mapLink: StudioMapLink, maps: Record<number, StudioMap>): MapLinkNodeType => ({
  id: 'main-map-link-node',
  position: { x: 0, y: 0 },
  type: 'mainMapLinkNode',
  data: { mapLink, maps },
  draggable: false,
  className: 'nopan',
});

export const buildLinks = (mapLink: StudioMapLink, maps: Record<number, StudioMap>, tileSize: number): MapLinkNodeType[] => {
  return [
    ...buildLinksByCardinal(mapLink, 'east', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'north', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'south', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'west', maps, tileSize),
  ];
};

export const buildAddMapNodes = (
  mapLink: StudioMapLink,
  maps: Record<number, StudioMap>,
  tileSize: number,
  dialogsRef?: MapLinkDialogsRef
): MapLinkNodeType[] => {
  return MAP_LINK_CARDINAL_LIST.reduce<MapLinkNodeType[]>(
    (prev, cardinal) => [...prev, buildAddMapByCardinal(mapLink, cardinal, maps, tileSize, dialogsRef)],
    []
  );
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
