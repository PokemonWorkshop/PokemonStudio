import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';

export const INFORMATION_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ type1: true, type2: true, frontOffsetY: true });
