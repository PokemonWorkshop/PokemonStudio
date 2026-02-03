export const STUDIO_EVENT_COMMAND_CATEGORY_LIST = [
  'messages',
  'player_interactions',
  'flow_control',
  'game_interfaces',
  'movement',
  'game_data',
  'battles',
  'inventory',
  'save',
  'quests',
  'audio',
  'visual_effects',
  'visual_environment',
  'scripting',
] as const;
export type StudioEventCommandCategory = (typeof STUDIO_EVENT_COMMAND_CATEGORY_LIST)[number];
