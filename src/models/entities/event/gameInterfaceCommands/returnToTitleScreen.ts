import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_RETURN_TO_TITLE_SCREEN_VALIDATOR = z.object({
  type: z.literal('return_to_title_screen'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandReturnToTitleScreen = z.infer<typeof EVENT_COMMAND_RETURN_TO_TITLE_SCREEN_VALIDATOR>;
