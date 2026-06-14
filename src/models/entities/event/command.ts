import { POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { z } from 'zod';
import type { StudioEventCommandCategory } from './category';

export const COMMAND_ID_VALIDATOR = z.string().brand('CommandId');
export type CommandId = z.infer<typeof COMMAND_ID_VALIDATOR>;

export const COMMAND_CONNECTION_ID_VALIDATOR = z.string().brand('ConnectionId');
export type ConnectionId = z.infer<typeof COMMAND_CONNECTION_ID_VALIDATOR>;

const EVENT_COMMAND_STUDIO_DATA_VALIDATOR = z.object({
  x: z.number().int(),
  y: z.number().int(),
  comments: z.array(z.string()),
});

export const EVENT_COMMAND_CONNECTION_VALIDATOR = z.object({
  sourceHandle: z.string(),
  target: COMMAND_ID_VALIDATOR,
  targetHandle: z.string(),
});

export type StudioEventCommandConnection = z.infer<typeof EVENT_COMMAND_CONNECTION_VALIDATOR>;

//#region Messages

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

//#endregion

//#region Scripting

export const EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR = z.object({
  type: z.literal('insert_script'),
  script: z.string().default(''),
  connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
  studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
});

export type StudioEventCommandInsertScript = z.infer<typeof EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR>;

//#endregion

const GENERIC_COMMAND = <T extends string>(type: T) =>
  z.object({
    type: z.literal(type),
    connections: z.record(COMMAND_CONNECTION_ID_VALIDATOR, EVENT_COMMAND_CONNECTION_VALIDATOR),
    studioData: EVENT_COMMAND_STUDIO_DATA_VALIDATOR,
  });

export const EVENT_COMMAND_VALIDATOR = z.discriminatedUnion('type', [
  EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR,
  GENERIC_COMMAND('narrator_settings'),
  GENERIC_COMMAND('manage_message_box'),
  GENERIC_COMMAND('show_choice'),
  GENERIC_COMMAND('wait_key_press'),
  GENERIC_COMMAND('record_key_press'),
  GENERIC_COMMAND('input_creature_name'),
  GENERIC_COMMAND('input_character_name'),
  GENERIC_COMMAND('ask_player_for_number'),
  GENERIC_COMMAND('create_loop'),
  GENERIC_COMMAND('exit_loop'),
  GENERIC_COMMAND('manage_conditions'),
  GENERIC_COMMAND('go_to'),
  GENERIC_COMMAND('wait_for_set_time'),
  GENERIC_COMMAND('stop_event_execution'),
  GENERIC_COMMAND('call_event'),
  GENERIC_COMMAND('trigger_event'),
  GENERIC_COMMAND('change_event_parameters'),
  GENERIC_COMMAND('move_event'),
  GENERIC_COMMAND('teleport_event'),
  GENERIC_COMMAND('teleport_player'),
  GENERIC_COMMAND('wait_move_completion'),
  GENERIC_COMMAND('manage_event_reappearance'),
  GENERIC_COMMAND('manage_path_finding'),
  GENERIC_COMMAND('manage_follow_me'),
  GENERIC_COMMAND('manage_variables'),
  GENERIC_COMMAND('manage_event_variables'),
  GENERIC_COMMAND('manage_timer'),
  GENERIC_COMMAND('change_character_name'),
  GENERIC_COMMAND('start_trainer_battle'),
  GENERIC_COMMAND('start_wild_encounter'),
  GENERIC_COMMAND('start_scripted_battle'),
  GENERIC_COMMAND('manage_random_encounters'),
  GENERIC_COMMAND('manage_player_items'),
  GENERIC_COMMAND('manage_player_money'),
  GENERIC_COMMAND('manage_dex'),
  GENERIC_COMMAND('set_active_dex'),
  GENERIC_COMMAND('give_badge'),
  GENERIC_COMMAND('manage_access_save_menu'),
  GENERIC_COMMAND('open_save_menu'),
  GENERIC_COMMAND('manage_autosave'),
  GENERIC_COMMAND('force_autosave'),
  GENERIC_COMMAND('force_save'),
  GENERIC_COMMAND('open_scene'),
  GENERIC_COMMAND('open_shop'),
  GENERIC_COMMAND('open_custom_scene'),
  GENERIC_COMMAND('manage_access_main_menu'),
  GENERIC_COMMAND('trigger_game_over'),
  GENERIC_COMMAND('return_to_title_screen'),
  GENERIC_COMMAND('open_creature_shop'),
  GENERIC_COMMAND('start_quest'),
  GENERIC_COMMAND('display_hidden_objective'),
  GENERIC_COMMAND('validate_quest_objectives'),
  GENERIC_COMMAND('display_quest_progress'),
  GENERIC_COMMAND('complete_quest'),
  GENERIC_COMMAND('play_sound'),
  GENERIC_COMMAND('stop_current_sound'),
  GENERIC_COMMAND('change_default_sound'),
  GENERIC_COMMAND('memorize_background_sounds'),
  GENERIC_COMMAND('restore_background_sounds'),
  GENERIC_COMMAND('play_creature_cry'),
  GENERIC_COMMAND('change_screen_tone'),
  GENERIC_COMMAND('display_animation'),
  GENERIC_COMMAND('display_screen_animation'),
  GENERIC_COMMAND('display_emotion'),
  GENERIC_COMMAND('manage_image'),
  GENERIC_COMMAND('manage_camera'),
  GENERIC_COMMAND('manage_dynamic_light'),
  GENERIC_COMMAND('change_weather'),
  GENERIC_COMMAND('manage_map_fog'),
  GENERIC_COMMAND('manage_map_panorama'),
  GENERIC_COMMAND('change_battle_background'),
  EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR,
]);

export type StudioEventCommand = z.infer<typeof EVENT_COMMAND_VALIDATOR>;
export type StudioEventCommandType = z.infer<typeof EVENT_COMMAND_VALIDATOR>['type'];
export type StudioEventCommandData<T> = Omit<T, 'connections' | 'studioData'>;

export type EventCommandForCategory = {
  commandType: StudioEventCommandType;
  helper?: boolean;
  enabled?: boolean;
};

export const COMMANDS_FROM_CATEGORY: Record<StudioEventCommandCategory, EventCommandForCategory[]> = {
  messages: [
    { commandType: 'show_message', enabled: true },
    { commandType: 'narrator_settings' },
    { commandType: 'manage_message_box' },
    { commandType: 'show_choice' },
  ],
  player_interactions: [
    { commandType: 'wait_key_press' },
    { commandType: 'record_key_press' },
    { commandType: 'input_creature_name' },
    { commandType: 'input_character_name' },
    { commandType: 'ask_player_for_number' },
  ],
  flow_control: [
    { commandType: 'create_loop' },
    { commandType: 'exit_loop' },
    { commandType: 'manage_conditions' },
    { commandType: 'go_to' },
    { commandType: 'wait_for_set_time' },
    { commandType: 'stop_event_execution' },
    { commandType: 'call_event' },
    { commandType: 'trigger_event' },
  ],
  movement: [
    { commandType: 'change_event_parameters' },
    { commandType: 'move_event' },
    { commandType: 'teleport_event' },
    { commandType: 'teleport_player' },
    { commandType: 'wait_move_completion' },
    { commandType: 'manage_event_reappearance' },
    { commandType: 'manage_path_finding' },
    { commandType: 'manage_follow_me' },
  ],
  game_data: [
    { commandType: 'manage_variables' },
    { commandType: 'manage_event_variables' },
    { commandType: 'manage_timer' },
    { commandType: 'change_character_name' },
  ],
  battles: [
    { commandType: 'start_trainer_battle' },
    { commandType: 'start_wild_encounter' },
    { commandType: 'start_scripted_battle' },
    { commandType: 'manage_random_encounters' },
  ],
  inventory: [
    { commandType: 'manage_player_items' },
    { commandType: 'manage_player_money' },
    { commandType: 'manage_dex' },
    { commandType: 'set_active_dex' },
    { commandType: 'give_badge' },
  ],
  save: [
    { commandType: 'manage_access_save_menu' },
    { commandType: 'open_save_menu' },
    { commandType: 'manage_autosave' },
    { commandType: 'force_autosave' },
    { commandType: 'force_save' },
  ],
  game_interfaces: [
    { commandType: 'open_scene' },
    { commandType: 'open_shop' },
    { commandType: 'open_custom_scene' },
    { commandType: 'manage_access_main_menu' },
    { commandType: 'trigger_game_over' },
    { commandType: 'return_to_title_screen' },
    { commandType: 'open_creature_shop' },
  ],
  quests: [
    { commandType: 'start_quest' },
    { commandType: 'display_hidden_objective' },
    { commandType: 'validate_quest_objectives' },
    { commandType: 'display_quest_progress' },
    { commandType: 'complete_quest', helper: true },
  ],
  audio: [
    { commandType: 'play_sound' },
    { commandType: 'stop_current_sound' },
    { commandType: 'change_default_sound' },
    { commandType: 'memorize_background_sounds' },
    { commandType: 'restore_background_sounds' },
    { commandType: 'play_creature_cry' },
  ],
  visual_effects: [
    { commandType: 'change_screen_tone' },
    { commandType: 'display_animation' },
    { commandType: 'display_screen_animation' },
    { commandType: 'display_emotion' },
    { commandType: 'manage_image' },
    { commandType: 'manage_camera' },
    { commandType: 'manage_dynamic_light' },
  ],
  visual_environment: [
    { commandType: 'change_weather' },
    { commandType: 'manage_map_fog' },
    { commandType: 'manage_map_panorama' },
    { commandType: 'change_battle_background' },
  ],
  scripting: [{ commandType: 'insert_script', enabled: true }],
};
