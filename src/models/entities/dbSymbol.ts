import { z } from 'zod';

export const DB_SYMBOL_VALIDATOR = z
  .string()
  .regex(/^[a-z_][a-z0-9_]+$/, 'Invalid dbSymbol format')
  .default('__undef__')
  .brand('dbSymbol');
export type DbSymbol = z.infer<typeof DB_SYMBOL_VALIDATOR>;

export const LAX_DB_SYMBOL_VALIDATOR = z.string().default('__undef__').brand('dbSymbol');
