import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const TRAINER_CLASS_VALIDATOR = z.object({
  klass: z.literal('TrainerClass'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
});
export type StudioTrainerClass = z.infer<typeof TRAINER_CLASS_VALIDATOR>;

export const TRAINER_CLASS_NAME_TEXT_ID = 100078;
export const TRAINER_CLASS_DESCRIPTION_TEXT_ID = 200007;
