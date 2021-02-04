// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import dashboard from '../../assets/i18n/en/dashboard.json';
import database_item_help from '../../assets/i18n/en/database_items_help.json';
import database_items from '../../assets/i18n/en/database_items.json';
import database_moves from '../../assets/i18n/en/database_moves.json';
import database_pokemon from '../../assets/i18n/en/database_pokemon.json';
import database_pokemon_help from '../../assets/i18n/en/database_pokemon_help.json';
import database_types from '../../assets/i18n/en/database_types.json';
import homepage from '../../assets/i18n/en/homepage.json';
import main_menu from '../../assets/i18n/en/main_menu.json';
import select from '../../assets/i18n/en/select.json';
import sub_menu from '../../assets/i18n/en/submenu_database.json';
import update from '../../assets/i18n/en/update.json';

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      dashboard: typeof dashboard;
      database_item_help: typeof database_item_help;
      database_items: typeof database_items;
      database_moves: typeof database_moves;
      database_pokemon: typeof database_pokemon;
      database_pokemon_help: typeof database_pokemon_help;
      database_types: typeof database_types;
      homepage: typeof homepage;
      main_menu: typeof main_menu;
      select: typeof select;
      sub_menu: typeof sub_menu;
      update: typeof update;
    };
  }
}
