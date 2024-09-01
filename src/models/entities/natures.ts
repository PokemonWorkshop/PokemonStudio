import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const NATURE_STATS_VALIDATOR = z.object({
  atk: POSITIVE_INT.max(999),
  dfe: POSITIVE_INT.max(999),
  ats: POSITIVE_INT.max(999),
  dfs: POSITIVE_INT.max(999),
  spd: POSITIVE_INT.max(999),
});
export type StudioNatureStats = z.infer<typeof NATURE_STATS_VALIDATOR>;

export const FLAVOR_VALIDATOR = z.union([z.literal('spicy'), z.literal('dry'), z.literal('sweet'), z.literal('bitter'), z.literal('sour')]);
export type StudioFlavor = z.infer<typeof FLAVOR_VALIDATOR>;

export const NATURE_FLAVORS_VALIDATOR = z.object({
  favourite: FLAVOR_VALIDATOR,
  detested: FLAVOR_VALIDATOR,
});
export type StudioNatureFlavors = z.infer<typeof NATURE_FLAVORS_VALIDATOR>;

export const NATURE_VALIDATOR = z.object({
  klass: z.literal('Nature'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  stats: NATURE_STATS_VALIDATOR,
  flavors: NATURE_FLAVORS_VALIDATOR,
});
export type StudioNature = z.infer<typeof NATURE_VALIDATOR>;

export const NATURE_NAME_TEXT_ID = 100008;
