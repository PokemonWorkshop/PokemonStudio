// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import dashboard from '../../assets/i18n/en/dashboard.json';
import dashboard_devices from '../../assets/i18n/en/dashboard_devices.json';
import dashboard_display from '../../assets/i18n/en/dashboard_display.json';
import dashboard_graphics from '../../assets/i18n/en/dashboard_graphics.json';
import dashboard_infos from '../../assets/i18n/en/dashboard_infos.json';
import dashboard_language from '../../assets/i18n/en/dashboard_language.json';
import dashboard_save from '../../assets/i18n/en/dashboard_save.json';
import dashboard_settings from '../../assets/i18n/en/dashboard_settings.json';
import database_abilities from '../../assets/i18n/en/database_abilities.json';
import database_items from '../../assets/i18n/en/database_items.json';
import database_moves from '../../assets/i18n/en/database_moves.json';
import database_pokemon from '../../assets/i18n/en/database_pokemon.json';
import database_types from '../../assets/i18n/en/database_types.json';
import database_groups from '../../assets/i18n/en/database_groups.json';
import database_quests from '../../assets/i18n/en/database_quests.json';
import database_trainers from '../../assets/i18n/en/database_trainers.json';
import database_zones from '../../assets/i18n/en/database_zones.json';
import database_dex from '../../assets/i18n/en/database_dex.json';
import homepage from '../../assets/i18n/en/homepage.json';
import main_menu from '../../assets/i18n/en/main_menu.json';
import select from '../../assets/i18n/en/select.json';
import submenu_database from '../../assets/i18n/en/submenu_database.json';
import update from '../../assets/i18n/en/update.json';
import editor from '../../assets/i18n/en/editor.json';
import error from '../../assets/i18n/en/error.json';
import loader from '../../assets/i18n/en/loader.json';
import deletion from '../../assets/i18n/en/deletion.json';
import psdk_update from '../../assets/i18n/en/psdk_update.json';
import drop from '../../assets/i18n/en/drop.json';
import save from '../../assets/i18n/en/save.json';
import pokemon_battler_list from '../../assets/i18n/en/pokemon_battler_list.json';
import bag_entry_list from '../../assets/i18n/en/bag_entry_list.json';
import unsaved_modal from '../../assets/i18n/en/unsaved_modal.json';

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      dashboard: typeof dashboard;
      dashboard_devices: typeof dashboard_devices;
      dashboard_display: typeof dashboard_display;
      dashboard_graphics: typeof dashboard_graphics;
      dashboard_infos: typeof dashboard_infos;
      dashboard_language: typeof dashboard_language;
      dashboard_save: typeof dashboard_save;
      dashboard_settings: typeof dashboard_settings;
      database_abilities: typeof database_abilities;
      database_items: typeof database_items;
      database_moves: typeof database_moves;
      database_pokemon: typeof database_pokemon;
      database_types: typeof database_types;
      database_groups: typeof database_groups;
      database_quests: typeof database_quests;
      database_trainers: typeof database_trainers;
      database_zones: typeof database_zones;
      database_dex: typeof database_dex;
      homepage: typeof homepage;
      main_menu: typeof main_menu;
      select: typeof select;
      submenu_database: typeof submenu_database;
      update: typeof update;
      editor: typeof editor;
      error: typeof error;
      loader: typeof loader;
      deletion: typeof deletion;
      psdk_update: typeof psdk_update;
      drop: typeof drop;
      save: typeof save;
      pokemon_battler_list: typeof pokemon_battler_list;
      bag_entry_list: typeof bag_entry_list;
      unsaved_modal: typeof unsaved_modal;
    };
  }
}
