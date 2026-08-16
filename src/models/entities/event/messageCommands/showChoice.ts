import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from '../../common';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const CHOICE_POSITION_VALIDATOR = z.union([z.literal('top'), z.literal('bottom')]);
export type StudioChoicePosition = z.infer<typeof CHOICE_POSITION_VALIDATOR>;

export const EVENT_COMMAND_SHOW_CHOICE_VALIDATOR = z.object({
  type: z.literal('show_choice'),
  choices: z.array(POSITIVE_OR_ZERO_INT),
  choicePosition: CHOICE_POSITION_VALIDATOR.default('bottom'),
  resultVariable: POSITIVE_OR_ZERO_INT.default(26), // Variable TMP_1 in RMXP
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandShowChoice = z.infer<typeof EVENT_COMMAND_SHOW_CHOICE_VALIDATOR>;
