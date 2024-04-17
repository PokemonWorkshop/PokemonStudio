import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { SHA1_VALIDATOR } from './sha1';

export const MAP_AUDIO_VALIDATOR = z.object({
  name: z.string(),
  volume: POSITIVE_OR_ZERO_INT.max(100),
  pitch: POSITIVE_INT.min(50).max(150),
});
export type StudioMapAudio = z.infer<typeof MAP_AUDIO_VALIDATOR>;

export const MAP_VALIDATOR = z.object({
  klass: z.literal('Map'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  stepsAverage: POSITIVE_INT,
  bgm: MAP_AUDIO_VALIDATOR,
  bgs: MAP_AUDIO_VALIDATOR,
  tiledFilename: z.string(),
  mtime: POSITIVE_OR_ZERO_INT,
  sha1: SHA1_VALIDATOR.or(z.literal('')),
  tileMetadata: z.unknown(),
});
export type StudioMap = z.infer<typeof MAP_VALIDATOR>;

export const MAP_NAME_TEXT_ID = 200002;
export const MAP_DESCRIPTION_TEXT_ID = 200003;
