import { DB_SYMBOL_VALIDATOR } from '@modelEntities/dbSymbol';
import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_START_QUEST_VALIDATOR = z.object({
  type: z.literal('start_quest'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  quests: z.array(DB_SYMBOL_VALIDATOR),
});

export type StudioEventCommandStartQuest = z.infer<typeof EVENT_COMMAND_START_QUEST_VALIDATOR>;
