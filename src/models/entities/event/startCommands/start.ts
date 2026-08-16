import { POSITIVE_INT } from '@modelEntities/common';
import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const START_TRIGGERS = ['key_press', 'contact', 'overlap', 'before_transition', 'called', 'parallel', 'cinematic'] as const;

export const TRIGGER_VALIDATOR = z.union([
  z.literal('key_press'),
  z.literal('contact'),
  z.literal('overlap'),
  z.literal('before_transition'),
  z.literal('called'),
  z.literal('parallel'),
  z.literal('cinematic'),
]);

export const EVENT_COMMAND_START_VALIDATOR = z.object({
  type: z.literal('start'),
  trigger: TRIGGER_VALIDATOR,
  priority: POSITIVE_INT,
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandStart = z.infer<typeof EVENT_COMMAND_START_VALIDATOR>;
