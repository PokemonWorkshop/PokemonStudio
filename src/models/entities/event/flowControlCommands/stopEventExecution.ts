import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_STOP_EVENT_EXECUTION_VALIDATOR = z.object({
  type: z.literal('stop_event_execution'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandStopEventExecution = z.infer<typeof EVENT_COMMAND_STOP_EVENT_EXECUTION_VALIDATOR>;
