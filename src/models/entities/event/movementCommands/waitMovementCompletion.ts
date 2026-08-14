import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from '../../common';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR = z.object({
  waitAllEvents: z.boolean().default(false),
  waitById: z.array(z.string()).default([]),
  timeout: POSITIVE_OR_ZERO_INT,

  type: z.literal('wait_move_completion'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventWaitMovementCompletion = z.infer<typeof EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR>;
