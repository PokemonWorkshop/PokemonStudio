import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { z } from 'zod';
import {
  AUDIO_CHANNEL_VALIDATOR,
  COMMAND_CONNECTION_ID_VALIDATOR,
  EVENT_COMMAND_CONNECTION_VALIDATOR,
  EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
} from '../globalCommand';

export const EVENT_COMMAND_PLAY_SOUND_VALIDATOR = z.object({
  type: z.literal('play_sound'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  channel: AUDIO_CHANNEL_VALIDATOR,
  filename: z.string(),
  volume: POSITIVE_OR_ZERO_INT.max(100),
  pitch: POSITIVE_INT.min(50).max(150),
});

export type StudioEventCommandPlaySound = z.infer<typeof EVENT_COMMAND_PLAY_SOUND_VALIDATOR>;
