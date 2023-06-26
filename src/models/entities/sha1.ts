import { z } from 'zod';

export const SHA1_VALIDATOR = z
  .string()
  .regex(/^[a-fA-F0-9]{40}$/, 'Invalid sha1 format')
  .brand('sha1');

export type Sha1 = z.infer<typeof SHA1_VALIDATOR>;
