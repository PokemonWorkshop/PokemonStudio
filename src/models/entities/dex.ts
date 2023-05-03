import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR, LAX_DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const DEX_CREATURE_VALIDATOR = z.object({
  dbSymbol: LAX_DB_SYMBOL_VALIDATOR,
  form: POSITIVE_OR_ZERO_INT,
});

export type StudioDexCreature = z.infer<typeof DEX_CREATURE_VALIDATOR>;

export const DEX_VALIDATOR = z.object({
  klass: z.literal('Dex'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  startId: POSITIVE_OR_ZERO_INT,
  csv: z.object({
    csvFileId: POSITIVE_OR_ZERO_INT,
    csvTextIndex: POSITIVE_OR_ZERO_INT,
  }),
  creatures: z.array(DEX_CREATURE_VALIDATOR),
});

export type StudioDex = z.infer<typeof DEX_VALIDATOR>;
export type StudioDexType = 'national' | 'regional';

export const DEX_DEFAULT_NAME_TEXT_ID = 100063;
