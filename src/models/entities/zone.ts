import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

const MAP_COORDINATE_VALIDATOR = z.object({
  x: z.union([POSITIVE_OR_ZERO_INT, z.null()]),
  y: z.union([POSITIVE_OR_ZERO_INT, z.null()]),
});

export const ZONE_VALIDATOR = z.object({
  klass: z.literal('Zone'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  maps: z.array(POSITIVE_OR_ZERO_INT),
  worldmaps: z.array(z.union([POSITIVE_OR_ZERO_INT, z.null()])),
  panelId: z.number().finite(),
  warp: MAP_COORDINATE_VALIDATOR,
  position: MAP_COORDINATE_VALIDATOR,
  isFlyAllowed: z.boolean(),
  isWarpDisallowed: z.boolean(),
  forcedWeather: z.union([z.null(), z.literal(-1), z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  wildGroups: z.array(DB_SYMBOL_VALIDATOR),
});
export type StudioZone = z.infer<typeof ZONE_VALIDATOR>;

export const ZONE_DESCRIPTION_TEXT_ID = 100064;
export const ZONE_NAME_TEXT_ID = 100010;
