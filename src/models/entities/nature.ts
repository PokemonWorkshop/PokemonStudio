import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const DEFAULT_NATURES = [
  'adamant',
  'bashful',
  'bold',
  'brave',
  'calm',
  'careful',
  'docile',
  'gentle',
  'hardy',
  'hasty',
  'impish',
  'jolly',
  'lax',
  'lonely',
  'mild',
  'modest',
  'naive',
  'naughty',
  'quiet',
  'quirky',
  'rash',
  'relaxed',
  'sassy',
  'serious',
  'timid',
] as const;
export type StudioDefaultNature = (typeof DEFAULT_NATURES)[number];

export const NATURE_STATS_VALIDATOR = z.object({
  atk: POSITIVE_INT.max(999),
  dfe: POSITIVE_INT.max(999),
  ats: POSITIVE_INT.max(999),
  dfs: POSITIVE_INT.max(999),
  spd: POSITIVE_INT.max(999),
});
export type StudioNatureStats = z.infer<typeof NATURE_STATS_VALIDATOR>;

export const STUDIO_NATURE_STATS_LIST = ['atk', 'dfe', 'ats', 'dfs', 'spd'] as const;
export type StudioNatureStatsListType = (typeof STUDIO_NATURE_STATS_LIST)[number];

export const FLAVOR_VALIDATOR = z.union([
  z.literal('spicy'),
  z.literal('dry'),
  z.literal('sweet'),
  z.literal('bitter'),
  z.literal('sour'),
  z.literal('none'),
]);
export type StudioFlavor = z.infer<typeof FLAVOR_VALIDATOR>;
export const FLAVOR_LIST = ['none', 'spicy', 'dry', 'sweet', 'bitter', 'sour'] as const;

export const NATURE_FLAVORS_VALIDATOR = z.object({
  liked: FLAVOR_VALIDATOR,
  disliked: FLAVOR_VALIDATOR,
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
