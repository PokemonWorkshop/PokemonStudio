import type { StudioEventCommandCategory } from './category';

export type StudioEventCommand =
  | 'add_condition'
  | 'add_jump_another_command'
  | 'call_event'
  | 'insert_loop'
  | 'show_message'
  | 'stop_event_execution';

export type EventCommandHelper = {
  commandType: StudioEventCommand;
  helper?: boolean;
};

export const COMMANDS_FROM_CATEGORY: Record<StudioEventCommandCategory, EventCommandHelper[]> = {
  flow_control: [
    { commandType: 'call_event', helper: true },
    { commandType: 'add_condition' },
    { commandType: 'insert_loop' },
    { commandType: 'stop_event_execution' },
    { commandType: 'add_jump_another_command' },
  ],
  game_interfaces: [],
  messages: [{ commandType: 'show_message' }],
  player_interaction: [],
};
