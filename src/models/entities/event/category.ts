export const STUDIO_EVENT_COMMAND_CATEGORY_LIST = [
  'game_data',
  'game_interfaces',
  'battles',
  'flow_control',
  'movement',
  'inventory',
  'messages',
  'player_interactions',
  'audio',
  'visual_effects',
  'start',
  'quests',
  'visual_environment',
  'save',
  'scripting',
] as const;
export type StudioEventCommandCategory = (typeof STUDIO_EVENT_COMMAND_CATEGORY_LIST)[number];
