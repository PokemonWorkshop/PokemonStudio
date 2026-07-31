import AudioIcon from '@assets/icons/global/audio-icon.svg';
import BattlesIcon from '@assets/icons/global/battles-icon.svg';
import FlowControlIcon from '@assets/icons/global/flow-control-icon.svg';
import GameDataIcon from '@assets/icons/global/game-data-icon.svg';
import GameInterfacesIcon from '@assets/icons/global/game-interfaces-icon.svg';
import InventoryIcon from '@assets/icons/global/inventory-icon.svg';
import MessagesIcon from '@assets/icons/global/messages-icon.svg';
import MovementIcon from '@assets/icons/global/movement-icon.svg';
import PlayerInteractionsIcon from '@assets/icons/global/player-interactions-icon.svg';
import QuestsIcon from '@assets/icons/global/quests-icon.svg';
import SaveIcon from '@assets/icons/global/save-icon.svg';
import ScriptingIcon from '@assets/icons/global/scripting-icon.svg';
import StartIcon from '@assets/icons/global/start-icon.svg';
import VisualEffectsIcon from '@assets/icons/global/visual-effects-icon.svg';
import VisualEnvironmentIcon from '@assets/icons/global/visual-environment-icon.svg';
import type { StudioEventCommandCategory } from '@modelEntities/event/category';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import React, { JSX } from 'react';
import styled from 'styled-components';

export type EventIconColor =
  | 'silverDark'
  | 'goldDark'
  | 'bronzeDark'
  | 'topazDark'
  | 'vermillionDark'
  | 'magentaDark'
  | 'amethystDark'
  | 'lavenderDark'
  | 'cobaltDark'
  | 'ceruleanDark'
  | 'cyanDark'
  | 'celadonDark'
  | 'peridotDark'
  | 'oliveDark'
  | 'emeraldDark';
type EventIconContainerProps = {
  color: EventIconColor;
  size?: 's' | 'm';
};
type EventIconData = { icon: JSX.Element; color: EventIconColor };

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
  background-color: ${({ theme, color }) => theme.colors[`${color}11`]};

  &[data-size='s'] {
    height: 24px;
    min-width: 24px;

    svg {
      width: 16px;
      height: auto;
    }
  }
`;

export const EventCommandIconContainer = styled.span<EventIconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  color: ${({ theme, color }) => theme.colors[`${color}11`]};
`;

export const IconsFromCategory: Record<StudioEventCommandCategory, EventIconData> = {
  flow_control: { icon: <FlowControlIcon />, color: 'magentaDark' },
  game_interfaces: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  messages: { icon: <MessagesIcon />, color: 'cobaltDark' },
  player_interactions: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  movement: { icon: <MovementIcon />, color: 'amethystDark' },
  game_data: { icon: <GameDataIcon />, color: 'silverDark' },
  battles: { icon: <BattlesIcon />, color: 'vermillionDark' },
  inventory: { icon: <InventoryIcon />, color: 'lavenderDark' },
  save: { icon: <SaveIcon />, color: 'bronzeDark' },
  quests: { icon: <QuestsIcon />, color: 'peridotDark' },
  audio: { icon: <AudioIcon />, color: 'cyanDark' },
  visual_effects: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  visual_environment: { icon: <VisualEnvironmentIcon />, color: 'oliveDark' },
  scripting: { icon: <ScriptingIcon />, color: 'goldDark' },
  start: { icon: <StartIcon />, color: 'emeraldDark' },
};

export const IconsFromCommand: Record<StudioEventCommandType, EventIconData> = {
  show_message: { icon: <MessagesIcon />, color: 'cobaltDark' },
  narrator_settings: { icon: <MessagesIcon />, color: 'cobaltDark' },
  manage_message_box: { icon: <MessagesIcon />, color: 'cobaltDark' },
  show_choice: { icon: <MessagesIcon />, color: 'cobaltDark' },
  wait_key_press: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  record_key_press: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  input_creature_name: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  input_character_name: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  ask_player_for_number: { icon: <PlayerInteractionsIcon />, color: 'ceruleanDark' },
  create_loop: { icon: <FlowControlIcon />, color: 'magentaDark' },
  exit_loop: { icon: <FlowControlIcon />, color: 'magentaDark' },
  manage_conditions: { icon: <FlowControlIcon />, color: 'magentaDark' },
  go_to: { icon: <FlowControlIcon />, color: 'magentaDark' },
  wait_for_set_time: { icon: <FlowControlIcon />, color: 'magentaDark' },
  stop_event_execution: { icon: <FlowControlIcon />, color: 'magentaDark' },
  call_event: { icon: <FlowControlIcon />, color: 'magentaDark' },
  trigger_event: { icon: <FlowControlIcon />, color: 'magentaDark' },
  start: { icon: <StartIcon />, color: 'emeraldDark' },
  change_event_parameters: { icon: <MovementIcon />, color: 'amethystDark' },
  move_event: { icon: <MovementIcon />, color: 'amethystDark' },
  teleport_event: { icon: <MovementIcon />, color: 'amethystDark' },
  teleport_player: { icon: <MovementIcon />, color: 'amethystDark' },
  wait_move_completion: { icon: <MovementIcon />, color: 'amethystDark' },
  manage_event_reappearance: { icon: <MovementIcon />, color: 'amethystDark' },
  manage_path_finding: { icon: <MovementIcon />, color: 'amethystDark' },
  manage_follow_me: { icon: <MovementIcon />, color: 'amethystDark' },
  manage_variables: { icon: <GameDataIcon />, color: 'silverDark' },
  manage_event_variables: { icon: <GameDataIcon />, color: 'silverDark' },
  manage_timer: { icon: <GameDataIcon />, color: 'silverDark' },
  change_character_name: { icon: <GameDataIcon />, color: 'silverDark' },
  start_trainer_battle: { icon: <BattlesIcon />, color: 'vermillionDark' },
  start_wild_encounter: { icon: <BattlesIcon />, color: 'vermillionDark' },
  start_scripted_battle: { icon: <BattlesIcon />, color: 'vermillionDark' },
  manage_random_encounters: { icon: <BattlesIcon />, color: 'vermillionDark' },
  manage_player_items: { icon: <InventoryIcon />, color: 'lavenderDark' },
  manage_player_money: { icon: <InventoryIcon />, color: 'lavenderDark' },
  manage_dex: { icon: <InventoryIcon />, color: 'lavenderDark' },
  set_active_dex: { icon: <InventoryIcon />, color: 'lavenderDark' },
  give_badge: { icon: <InventoryIcon />, color: 'lavenderDark' },
  manage_access_save_menu: { icon: <SaveIcon />, color: 'bronzeDark' },
  open_save_menu: { icon: <SaveIcon />, color: 'bronzeDark' },
  manage_autosave: { icon: <SaveIcon />, color: 'bronzeDark' },
  force_autosave: { icon: <SaveIcon />, color: 'bronzeDark' },
  force_save: { icon: <SaveIcon />, color: 'bronzeDark' },
  open_scene: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  open_shop: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  open_custom_scene: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  manage_access_main_menu: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  trigger_game_over: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  return_to_title_screen: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  open_creature_shop: { icon: <GameInterfacesIcon />, color: 'topazDark' },
  start_quest: { icon: <QuestsIcon />, color: 'peridotDark' },
  display_hidden_objective: { icon: <QuestsIcon />, color: 'peridotDark' },
  validate_quest_objectives: { icon: <QuestsIcon />, color: 'peridotDark' },
  display_quest_progress: { icon: <QuestsIcon />, color: 'peridotDark' },
  complete_quest: { icon: <QuestsIcon />, color: 'peridotDark' },
  play_sound: { icon: <AudioIcon />, color: 'cyanDark' },
  stop_current_sound: { icon: <AudioIcon />, color: 'cyanDark' },
  change_default_sound: { icon: <AudioIcon />, color: 'cyanDark' },
  memorize_background_sounds: { icon: <AudioIcon />, color: 'cyanDark' },
  restore_background_sounds: { icon: <AudioIcon />, color: 'cyanDark' },
  play_creature_cry: { icon: <AudioIcon />, color: 'cyanDark' },
  change_screen_tone: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  display_animation: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  display_screen_animation: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  display_emotion: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  manage_image: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  manage_camera: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  manage_dynamic_light: { icon: <VisualEffectsIcon />, color: 'celadonDark' },
  change_weather: { icon: <VisualEnvironmentIcon />, color: 'oliveDark' },
  manage_map_fog: { icon: <VisualEnvironmentIcon />, color: 'oliveDark' },
  manage_map_panorama: { icon: <VisualEnvironmentIcon />, color: 'oliveDark' },
  change_battle_background: { icon: <VisualEnvironmentIcon />, color: 'oliveDark' },
  insert_script: { icon: <ScriptingIcon />, color: 'goldDark' },
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
