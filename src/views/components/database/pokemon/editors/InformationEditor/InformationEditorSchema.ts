import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';
import { z } from 'zod';

export const INFORMATION_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ type1: true, type2: true, frontOffsetY: true }).extend({
  name: z.string().min(1),
});
