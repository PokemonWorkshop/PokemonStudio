export const STUDIO_EVENT_COMMAND_CATEGORY_LIST = ['messages', 'player_interaction', 'flow_control', 'game_interfaces'] as const;
export type StudioEventCommandCategory = (typeof STUDIO_EVENT_COMMAND_CATEGORY_LIST)[number];
