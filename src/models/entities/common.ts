import { z } from 'zod';

export const POSITIVE_OR_ZERO_INT = z.number().int().nonnegative();
export const POSITIVE_INT = z.number().int().positive();
export const POSITIVE_OR_ZERO_FLOAT = z.number().nonnegative();
export const POSITIVE_FLOAT = z.number().positive();
export const AUDIO_VALIDATOR = z.object({
  name: z.string(),
  volume: POSITIVE_OR_ZERO_INT.max(100),
  pitch: POSITIVE_INT.min(50).max(150),
});
