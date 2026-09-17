import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from '../../common';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const MESSAGE_BOX_POSITION_VALIDATOR = z.union([z.literal('top'), z.literal('middle'), z.literal('bottom')]);
export type StudioMessageBoxPosition = z.infer<typeof MESSAGE_BOX_POSITION_VALIDATOR>;

export const PORTRAIT_VALIDATOR = z.object({
  image: z.string().default(''),
  isMirrored: z.boolean().default(false),
  position: z.number().int().default(0),
  opacity: z.number().int().default(100),
});
export type StudioPortrait = z.infer<typeof PORTRAIT_VALIDATOR>;

export const EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR = z.object({
  type: z.literal('show_message'),
  message: POSITIVE_OR_ZERO_INT,
  allowSkipping: z.boolean().default(false),
  narrator: POSITIVE_OR_ZERO_INT,
  nameColor: z.string().default('#000000'),
  showMessageBox: z.boolean().default(true),
  messageBoxPosition: MESSAGE_BOX_POSITION_VALIDATOR.default('bottom'),
  messageBoxAppearance: z.string().default(''),
  lookAtThisEvent: z.boolean().default(false),
  lookToOtherEvent: z.string().default('__undef__'),
  minimap: z.string().default(''),
  portraits: z.array(PORTRAIT_VALIDATOR).default([]),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandShowMessage = z.infer<typeof EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR>;
