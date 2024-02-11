import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { SHA1_VALIDATOR } from './sha1';

export const MAP_VALIDATOR = z.object({
  klass: z.literal('Map'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  stepsAverage: POSITIVE_INT,
  bgm: z.string(),
  bgs: z.string(),
  tiledFilename: z.string(),
  mtime: POSITIVE_OR_ZERO_INT,
  sha1: SHA1_VALIDATOR.or(z.literal('')),
  tileMetadata: z.unknown(),
});
export type StudioMap = z.infer<typeof MAP_VALIDATOR>;

export const MAP_NAME_TEXT_ID = 200002;
export const MAP_DESCRIPTION_TEXT_ID = 200003;
