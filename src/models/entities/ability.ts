import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const ABILITY_VALIDATOR = z.object({
  klass: z.literal('Ability'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  textId: POSITIVE_OR_ZERO_INT,
});

export type StudioAbility = z.infer<typeof ABILITY_VALIDATOR>;

export const ABILITY_NAME_TEXT_ID = 4;
export const ABILITY_DESCRIPTION_TEXT_ID = 5;
