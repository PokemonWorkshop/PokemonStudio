import { z } from 'zod';

export const COMMAND_ID_VALIDATOR = z.string().brand('CommandId');
export type CommandId = z.infer<typeof COMMAND_ID_VALIDATOR>;

export const COMMAND_CONNECTION_ID_VALIDATOR = z.string().brand('ConnectionId');
export type ConnectionId = z.infer<typeof COMMAND_CONNECTION_ID_VALIDATOR>;

export const EVENT_COMMAND_STUDIO_DATA_VALIDATOR = z.object({
  x: z.number().int(),
  y: z.number().int(),
  comments: z.array(z.string()),
});

export const EVENT_COMMAND_CONNECTION_VALIDATOR = z.object({
  sourceHandle: z.string(),
  target: COMMAND_ID_VALIDATOR,
  targetHandle: z.string(),
});
