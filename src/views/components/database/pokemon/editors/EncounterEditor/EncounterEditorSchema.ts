import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';

export const ENCOUNTER_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ catchRate: true, femaleRate: true, itemHeld: true });
