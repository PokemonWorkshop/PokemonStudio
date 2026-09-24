import { z } from 'zod';
import { COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR, EVENT_COMMAND_STUDIO_DATA_VALIDATOR } from '../globalCommand';

export const EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR = z.object({
  type: z.literal('manage_access_save_menu'),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  action: z.union([z.literal('enable'), z.literal('disable'), z.literal('toggle')]),
});

export type StudioEventCommandManageAccessSaveMenu = z.infer<typeof EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR>;
