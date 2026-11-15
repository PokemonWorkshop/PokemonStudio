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

export const TOGGLE_VALUES_VALIDATOR = z.union([z.literal('enable'), z.literal('disable'), z.literal('toggle')]);
export type StudioToggleValue = z.infer<typeof TOGGLE_VALUES_VALIDATOR>;

export const AUDIO_BACKGROUND_CHANNEL_VALIDATOR = z.union([z.literal('bgm'), z.literal('bgs')]);
export type AudioBackgroundChannel = z.infer<typeof AUDIO_BACKGROUND_CHANNEL_VALIDATOR>;

export const AUDIO_EFFECT_CHANNEL_VALIDATOR = z.union([z.literal('se'), z.literal('me')]);
export type AudioEffectChannel = z.infer<typeof AUDIO_EFFECT_CHANNEL_VALIDATOR>;

export const AUDIO_CHANNEL_VALIDATOR = z.union([AUDIO_BACKGROUND_CHANNEL_VALIDATOR, AUDIO_EFFECT_CHANNEL_VALIDATOR]);
export type AudioChannel = z.infer<typeof AUDIO_CHANNEL_VALIDATOR>;
