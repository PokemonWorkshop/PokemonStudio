import { POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { z } from 'zod';
import {
  AUDIO_CHANNEL_VALIDATOR,
  COMMAND_CONNECTION_ID_VALIDATOR,
  EVENT_COMMAND_CONNECTION_VALIDATOR,
  EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
} from '../globalCommand';

export const EVENT_COMMAND_STOP_SOUNDS_VALIDATOR = z.object({
  type: z.literal('stop_sounds'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  channels: z.array(AUDIO_CHANNEL_VALIDATOR),
  fadeTime: POSITIVE_OR_ZERO_INT.min(1).max(60),
});

export type StudioEventCommandStopSounds = z.infer<typeof EVENT_COMMAND_STOP_SOUNDS_VALIDATOR>;
