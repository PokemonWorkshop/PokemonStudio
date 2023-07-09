import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const MAP_LINK_LINK_VALIDATOR = z.object({
  mapId: POSITIVE_OR_ZERO_INT,
  offset: z.number().finite(),
});
export type StudioMapLinkLink = z.infer<typeof MAP_LINK_LINK_VALIDATOR>;

export const MAP_LINK_VALIDATOR = z.object({
  klass: z.literal('MapLink'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  mapId: POSITIVE_OR_ZERO_INT,
  northMaps: z.array(MAP_LINK_LINK_VALIDATOR),
  eastMaps: z.array(MAP_LINK_LINK_VALIDATOR),
  southMaps: z.array(MAP_LINK_LINK_VALIDATOR),
  westMaps: z.array(MAP_LINK_LINK_VALIDATOR),
});
export type StudioMapLink = z.infer<typeof MAP_LINK_VALIDATOR>;

export const RMXP_MAP_VALIDATOR = z.object({
  id: z.number().finite(),
  name: z.string(),
});

export const MAP_LINK_CARDINAL_LIST = ['north', 'east', 'south', 'west'] as const;
export type StudioMapLinkCardinal = (typeof MAP_LINK_CARDINAL_LIST)[number];

export const getLinksFromMapLink = (mapLink: StudioMapLink, cardinal: StudioMapLinkCardinal): StudioMapLinkLink[] => {
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

export const setLinksFromMapLink = (mapLink: StudioMapLink, links: StudioMapLinkLink[], cardinal: StudioMapLinkCardinal): void => {
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
