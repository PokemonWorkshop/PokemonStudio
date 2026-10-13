import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR = z.object({
  type: z.literal('restore_background_sounds'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  channels: z.array(z.union([z.literal('bgm'), z.literal('bgs')])),
});

export type StudioEventCommandRestoreBackgroundSounds = z.infer<typeof EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR>;
