import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { ProjectData, State } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';
import type { Node } from '@xyflow/react';

export type MapLinkNodeData = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
  cardinal?: StudioMapLinkCardinal;
  index?: number;
};

export type MapLinkNodeType = Node<MapLinkNodeData, 'mainMapLinkNode' | 'mapLinkNode'>;

type MapSize = { width: number; height: number };

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);

export const checkValidMaplink = (mapId: number, state: State) => {
  const validMaps = getValidMaps(state.projectData.zones);
  const mapsFiltered = Object.values(state.projectData.maps).filter(({ id }) => validMaps.includes(id));
  return mapsFiltered.find((map) => map.id === mapId) ? true : false;
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

const getPosition = (cardinal: StudioMapLinkCardinal, mainMapSize: MapSize, mapSize: MapSize, offset: number, tileSize: number) => {
  switch (cardinal) {
    case 'east':
      return { x: mainMapSize.width * tileSize, y: offset * tileSize };
    case 'north':
      return { x: offset * tileSize, y: mapSize.height * tileSize };
    case 'south':
      return { x: offset * tileSize, y: -mainMapSize.height * tileSize };
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
      position: getPosition(cardinal, mainMapSize, mapSize, offset, tileSize),
      type: 'mapLinkNode',
      data: { mapLink, maps, cardinal, index },
    };
  });
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
