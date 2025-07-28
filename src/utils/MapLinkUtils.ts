import type { StudioMap } from '@modelEntities/map';
import { getLinksFromMapLink, type StudioMapLink, type StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { ProjectData, State } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);

export const checkValidMaplink = (mapId: number, state: State) => {
  const validMaps = getValidMaps(state.projectData.zones);
  const mapsFiltered = Object.values(state.projectData.maps).filter(({ id }) => validMaps.includes(id));
  return mapsFiltered.find((map) => map.id === mapId) ? true : false;
};

type MapSize = { width: number; height: number };

const getMapSize = (map: StudioMap): MapSize => {
  const width = map.tileMetadata?.width || 1;
  const height = map.tileMetadata?.height || 1;
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
};

const buildLinksByCardinal = (
  mapLink: StudioMapLink,
  cardinal: StudioMapLinkCardinal,
  maps: Record<number, StudioMap>,
  tileSize: number
): unknown[] => {
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

export const buildLinks = (mapLink: StudioMapLink, maps: Record<number, StudioMap>, tileSize: number) => {
  return [
    ...buildLinksByCardinal(mapLink, 'east', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'north', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'south', maps, tileSize),
    ...buildLinksByCardinal(mapLink, 'west', maps, tileSize),
  ];
};
