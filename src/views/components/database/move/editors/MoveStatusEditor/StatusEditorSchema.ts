import { MOVE_VALIDATOR } from '@modelEntities/move';

export const STATUS_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({ moveStatus: true });
