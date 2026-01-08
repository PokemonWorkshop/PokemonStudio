import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import { BasicEditor } from './BasicEditor';
import { StudioEventCommandType } from '@modelEntities/event/command';
import { InsertScriptEditor } from './InsertScriptEditor';
import type { CommandListId, StudioEvent } from '@modelEntities/event/event';

export type EventEditorAndDeletionKeys = StudioEventCommandType;
export type EventDialogsRef = React.RefObject<DialogRefData<EventEditorAndDeletionKeys>>;

/**
 * Editor overlay for the events.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const EventEditorOverlay = defineEditorOverlay<EventEditorAndDeletionKeys, { commandId?: CommandListId; event: StudioEvent }>(
  'eventEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { commandId, event }) => {
    switch (dialogToShow) {
      case 'show_message':
      case 'narrator_settings':
      case 'manage_message_box':
      case 'show_choice':
      case 'wait_key_press':
      case 'record_key_press':
      case 'input_creature_name':
      case 'input_character_name':
      case 'ask_player_for_number':
      case 'create_loop':
      case 'exit_loop':
      case 'manage_conditions':
      case 'go_to':
      case 'wait_for_set_time':
      case 'stop_event_execution':
      case 'call_event':
      case 'trigger_event':
      case 'change_event_parameters':
      case 'move_event':
      case 'teleport_event':
      case 'teleport_player':
      case 'wait_move_completion':
      case 'manage_event_reappearance':
      case 'manage_path_finding':
      case 'manage_follow_me':
      case 'manage_variables':
      case 'manage_event_variables':
      case 'manage_timer':
      case 'change_character_name':
      case 'start_trainer_battle':
      case 'start_wild_encounter':
      case 'start_scripted_battle':
      case 'manage_random_encounters':
      case 'manage_player_items':
      case 'manage_player_money':
      case 'manage_dex':
      case 'set_active_dex':
      case 'give_badge':
      case 'manage_access_save_menu':
      case 'open_save_menu':
      case 'manage_autosave':
      case 'force_autosave':
      case 'force_save':
      case 'open_scene':
      case 'open_shop':
      case 'open_custom_scene':
      case 'manage_access_main_menu':
      case 'trigger_game_over':
      case 'return_to_title_screen':
      case 'open_creature_shop':
      case 'start_quest':
      case 'display_hidden_objective':
      case 'validate_quest_objectives':
      case 'display_quest_progress':
      case 'complete_quest':
      case 'play_sound':
      case 'stop_current_sound':
      case 'change_default_sound':
      case 'memorize_background_sounds':
      case 'restore_background_sounds':
      case 'play_creature_cry':
      case 'change_screen_tone':
      case 'display_animation':
      case 'display_screen_animation':
      case 'display_emotion':
      case 'manage_image':
      case 'manage_camera':
      case 'manage_dynamic_light':
      case 'change_weather':
      case 'manage_map_fog':
      case 'manage_map_panorama':
      case 'change_battle_background':
        return <BasicEditor ref={handleCloseRef} />;
      case 'insert_script':
        return <InsertScriptEditor commandId={commandId} event={event} ref={handleCloseRef} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
