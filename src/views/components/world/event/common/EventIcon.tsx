import PlusIcon from '@assets/icons/global/plus-icon.svg';
import type { StudioEventCommandCategory } from '@modelEntities/event/category';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import React from 'react';
import styled from 'styled-components';

export type EventIconColor = 'blue' | 'violet';
type EventIconContainerProps = {
  color: EventIconColor;
  size?: 's' | 'm';
};
type EventIconData = { icon: JSX.Element; color: EventIconColor };

// TODO: Maybe move this in the theme
const EventColor: Record<EventIconColor, string> = {
  blue: 'rgb(37, 113, 201)',
  violet: 'rgb(149, 89, 208)',
};

export const EventCategoryIconContainer = styled.div.attrs<EventIconContainerProps>((props) => ({
  'data-size': props.size,
}))<EventIconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  color: rgb(28, 31, 39);
  background-color: ${({ color }) => EventColor[color]};

  &[data-size='s'] {
    height: 24px;
    min-width: 24px;

    svg {
      width: 10px;
      height: auto;
    }
  }
`;

export const EventCommandIconContainer = styled.span<EventIconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  color: ${({ color }) => EventColor[color]};
`;

export const IconsFromCategory: Record<StudioEventCommandCategory, EventIconData> = {
  flow_control: { icon: <PlusIcon />, color: 'violet' },
  game_interfaces: { icon: <PlusIcon />, color: 'violet' },
  messages: { icon: <PlusIcon />, color: 'violet' },
  player_interactions: { icon: <PlusIcon />, color: 'blue' },
  movement: { icon: <PlusIcon />, color: 'violet' },
  game_data: { icon: <PlusIcon />, color: 'violet' },
  battles: { icon: <PlusIcon />, color: 'violet' },
  inventory: { icon: <PlusIcon />, color: 'violet' },
  save: { icon: <PlusIcon />, color: 'violet' },
  quests: { icon: <PlusIcon />, color: 'violet' },
  audio: { icon: <PlusIcon />, color: 'violet' },
  visual_effects: { icon: <PlusIcon />, color: 'violet' },
  visual_environment: { icon: <PlusIcon />, color: 'violet' },
  scripting: { icon: <PlusIcon />, color: 'violet' },
};

export const IconsFromCommand: Record<StudioEventCommandType, EventIconData> = {
  show_message: { icon: <PlusIcon />, color: 'violet' },
  narrator_settings: { icon: <PlusIcon />, color: 'violet' },
  manage_message_box: { icon: <PlusIcon />, color: 'violet' },
  show_choice: { icon: <PlusIcon />, color: 'violet' },
  wait_key_press: { icon: <PlusIcon />, color: 'blue' },
  record_key_press: { icon: <PlusIcon />, color: 'blue' },
  input_creature_name: { icon: <PlusIcon />, color: 'blue' },
  input_character_name: { icon: <PlusIcon />, color: 'blue' },
  ask_player_for_number: { icon: <PlusIcon />, color: 'blue' },
  create_loop: { icon: <PlusIcon />, color: 'violet' },
  exit_loop: { icon: <PlusIcon />, color: 'violet' },
  manage_conditions: { icon: <PlusIcon />, color: 'violet' },
  go_to: { icon: <PlusIcon />, color: 'violet' },
  wait_for_set_time: { icon: <PlusIcon />, color: 'violet' },
  stop_event_execution: { icon: <PlusIcon />, color: 'violet' },
  call_event: { icon: <PlusIcon />, color: 'violet' },
  trigger_event: { icon: <PlusIcon />, color: 'violet' },
  change_event_parameters: { icon: <PlusIcon />, color: 'violet' },
  move_event: { icon: <PlusIcon />, color: 'violet' },
  teleport_event: { icon: <PlusIcon />, color: 'violet' },
  teleport_player: { icon: <PlusIcon />, color: 'violet' },
  wait_move_completion: { icon: <PlusIcon />, color: 'violet' },
  manage_event_reappearance: { icon: <PlusIcon />, color: 'violet' },
  manage_path_finding: { icon: <PlusIcon />, color: 'violet' },
  manage_follow_me: { icon: <PlusIcon />, color: 'violet' },
  manage_variables: { icon: <PlusIcon />, color: 'violet' },
  manage_event_variables: { icon: <PlusIcon />, color: 'violet' },
  manage_timer: { icon: <PlusIcon />, color: 'violet' },
  change_character_name: { icon: <PlusIcon />, color: 'violet' },
  start_trainer_battle: { icon: <PlusIcon />, color: 'violet' },
  start_wild_encounter: { icon: <PlusIcon />, color: 'violet' },
  start_scripted_battle: { icon: <PlusIcon />, color: 'violet' },
  manage_random_encounters: { icon: <PlusIcon />, color: 'violet' },
  manage_player_items: { icon: <PlusIcon />, color: 'violet' },
  manage_player_money: { icon: <PlusIcon />, color: 'violet' },
  manage_dex: { icon: <PlusIcon />, color: 'violet' },
  set_active_dex: { icon: <PlusIcon />, color: 'violet' },
  give_badge: { icon: <PlusIcon />, color: 'violet' },
  manage_access_save_menu: { icon: <PlusIcon />, color: 'violet' },
  open_save_menu: { icon: <PlusIcon />, color: 'violet' },
  manage_autosave: { icon: <PlusIcon />, color: 'violet' },
  force_autosave: { icon: <PlusIcon />, color: 'violet' },
  force_save: { icon: <PlusIcon />, color: 'violet' },
  open_scene: { icon: <PlusIcon />, color: 'violet' },
  open_shop: { icon: <PlusIcon />, color: 'violet' },
  open_custom_scene: { icon: <PlusIcon />, color: 'violet' },
  manage_access_main_menu: { icon: <PlusIcon />, color: 'violet' },
  trigger_game_over: { icon: <PlusIcon />, color: 'violet' },
  return_to_title_screen: { icon: <PlusIcon />, color: 'violet' },
  open_creature_shop: { icon: <PlusIcon />, color: 'violet' },
  start_quest: { icon: <PlusIcon />, color: 'violet' },
  display_hidden_objective: { icon: <PlusIcon />, color: 'violet' },
  validate_quest_objectives: { icon: <PlusIcon />, color: 'violet' },
  display_quest_progress: { icon: <PlusIcon />, color: 'violet' },
  complete_quest: { icon: <PlusIcon />, color: 'violet' },
  play_sound: { icon: <PlusIcon />, color: 'violet' },
  stop_current_sound: { icon: <PlusIcon />, color: 'violet' },
  change_default_sound: { icon: <PlusIcon />, color: 'violet' },
  memorize_background_sounds: { icon: <PlusIcon />, color: 'violet' },
  restore_background_sounds: { icon: <PlusIcon />, color: 'violet' },
  play_creature_cry: { icon: <PlusIcon />, color: 'violet' },
  change_screen_tone: { icon: <PlusIcon />, color: 'violet' },
  display_animation: { icon: <PlusIcon />, color: 'violet' },
  display_screen_animation: { icon: <PlusIcon />, color: 'violet' },
  display_emotion: { icon: <PlusIcon />, color: 'violet' },
  manage_image: { icon: <PlusIcon />, color: 'violet' },
  manage_camera: { icon: <PlusIcon />, color: 'violet' },
  manage_dynamic_light: { icon: <PlusIcon />, color: 'violet' },
  change_weather: { icon: <PlusIcon />, color: 'violet' },
  manage_map_fog: { icon: <PlusIcon />, color: 'violet' },
  manage_map_panorama: { icon: <PlusIcon />, color: 'violet' },
  change_battle_background: { icon: <PlusIcon />, color: 'violet' },
  insert_script: { icon: <PlusIcon />, color: 'violet' },
};

type EventIconProps = {
  icon: { type: 'category'; category: StudioEventCommandCategory } | { type: 'command'; command: StudioEventCommandType };
  size?: 's' | 'm';
};

export const EventIcon = ({ icon, size }: EventIconProps) => {
  const isCategory = icon.type === 'category';
  const { icon: iconJsx, color } = isCategory ? IconsFromCategory[icon.category] : IconsFromCommand[icon.command];

  return isCategory ? (
    <EventCategoryIconContainer color={color} size={size}>
      {iconJsx}
    </EventCategoryIconContainer>
  ) : (
    <EventCommandIconContainer color={color}>{iconJsx}</EventCommandIconContainer>
  );
};
