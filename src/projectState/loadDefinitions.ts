import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID, CREATURE_SPECIE_TEXT_ID, CREATURE_VALIDATOR } from '@modelEntities/creature';
import { registerEntity, registerEntityText } from './load';
import { ITEM_DESCRIPTION_TEXT_ID, ITEM_NAME_TEXT_ID, ITEM_PLURAL_NAME_TEXT_ID, ITEM_VALIDATOR } from '@modelEntities/item';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, MOVE_VALIDATOR } from '@modelEntities/move';
import { QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, QUEST_VALIDATOR } from '@modelEntities/quest';
import { TRAINER_DEFEAT_SENTENCE_TEXT_ID, TRAINER_NAME_TEXT_ID, TRAINER_VALIDATOR, TRAINER_VICTORY_SENTENCE_TEXT_ID } from '@modelEntities/trainer';
import { TYPE_NAME_TEXT_ID, TYPE_VALIDATOR } from '@modelEntities/type';
import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID, ZONE_VALIDATOR } from '@modelEntities/zone';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID, ABILITY_VALIDATOR } from '@modelEntities/ability';
import { GROUP_NAME_TEXT_ID, GROUP_VALIDATOR } from '@modelEntities/group';
import { DEX_VALIDATOR } from '@modelEntities/dex';
import { MAP_LINK_VALIDATOR } from '@modelEntities/mapLink';
import { MAP_NAME_TEXT_ID, MAP_VALIDATOR } from '@modelEntities/map';
import {
  CREDIT_CONFIG_VALIDATOR,
  DEVICES_CONFIG_VALIDATOR,
  DISPLAY_CONFIG_VALIDATOR,
  GAME_OPTION_CONFIG_VALIDATOR,
  GRAPHIC_CONFIG_VALIDATOR,
  INFO_CONFIG_VALIDATOR,
  LANGUAGE_CONFIG_VALIDATOR,
  NATURE_CONFIG_VALIDATOR,
  SAVE_CONFIG_VALIDATOR,
  SCENE_TITLE_CONFIG_VALIDATOR,
  SETTINGS_CONFIG_VALIDATOR,
  TEXT_CONFIG_VALIDATOR,
} from '@modelEntities/config';

const csv = (id: number) => `Data/Text/Dialogs/${id}.csv`;

registerEntity('ability', 'Data/Studio/abilities/*.json', ABILITY_VALIDATOR);
registerEntityText('ability', { propertyInEntity: 'name', discriminator: 'textId', textFileId: ABILITY_NAME_TEXT_ID });
registerEntityText('ability', { propertyInEntity: 'description', discriminator: 'textId', textFileId: ABILITY_DESCRIPTION_TEXT_ID });

registerEntity('config', 'Data/configs/credits_config.json', CREDIT_CONFIG_VALIDATOR);
// Ackchyually we shouldn't translate credits at all.
// registerEntityText('config', { dbSymbol: 'credits_config', propertyInEntity: 'chiefProjectTitle', discriminator: () => 0, textFileId: ??? });
// registerEntityText('config', { dbSymbol: 'credits_config', propertyInEntity: 'title', discriminator: 'textId', textFileId: ???, pathToProperties: ['leaders', Number] });

registerEntity('config', 'Data/configs/devices_config.json', DEVICES_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/display_config.json', DISPLAY_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/game_options_config.json', GAME_OPTION_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/graphic_config.json', GRAPHIC_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/infos_config.json', INFO_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/language_config.json', LANGUAGE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/natures.json', NATURE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/save_config.json', SAVE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/scene_title_config.json', SCENE_TITLE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/settings_config.json', SETTINGS_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/texts_config.json', TEXT_CONFIG_VALIDATOR);

registerEntity('creature', 'Data/Studio/pokemon/*.json', CREATURE_VALIDATOR);
registerEntityText('creature', { propertyInEntity: 'name', discriminator: 'id', textFileId: CREATURE_NAME_TEXT_ID });
registerEntityText('creature', { propertyInEntity: 'description', discriminator: 'id', textFileId: CREATURE_DESCRIPTION_TEXT_ID });
registerEntityText('creature', { propertyInEntity: 'specie', discriminator: 'id', textFileId: CREATURE_SPECIE_TEXT_ID });
// TODO: Add form related text + fix name to use functional discriminator

registerEntity('dex', 'Data/Studio/dex/*.json', DEX_VALIDATOR);
registerEntityText('dex', { propertyInEntity: 'name', discriminator: 'csv' });

registerEntity('group', 'Data/Studio/groups/*.json', GROUP_VALIDATOR);
registerEntityText('group', { propertyInEntity: 'name', discriminator: 'id', textFileId: GROUP_NAME_TEXT_ID });

// TODO: fix discriminated validator type in registerEntity
registerEntity('item', 'Data/Studio/items/*.json', ITEM_VALIDATOR);
registerEntityText('item', { propertyInEntity: 'name', discriminator: 'id', textFileId: ITEM_NAME_TEXT_ID });
registerEntityText('item', { propertyInEntity: 'pluralName', discriminator: 'id', textFileId: ITEM_PLURAL_NAME_TEXT_ID });
registerEntityText('item', { propertyInEntity: 'description', discriminator: 'id', textFileId: ITEM_DESCRIPTION_TEXT_ID });

registerEntity('map', 'Data/Studio/maps/*.json', MAP_VALIDATOR);
registerEntityText('map', { propertyInEntity: 'name', discriminator: 'mapId', textFileId: MAP_NAME_TEXT_ID });

registerEntity('mapLink', 'Data/Studio/maplinks/*.json', MAP_LINK_VALIDATOR);
registerEntityText('mapLink', { propertyInEntity: 'name', discriminator: 'mapId', textFileId: MAP_NAME_TEXT_ID });

registerEntity('move', 'Data/Studio/moves/*.json', MOVE_VALIDATOR);
registerEntityText('move', { propertyInEntity: 'name', discriminator: 'id', textFileId: MOVE_NAME_TEXT_ID });
registerEntityText('move', { propertyInEntity: 'description', discriminator: 'id', textFileId: MOVE_DESCRIPTION_TEXT_ID });

registerEntity('quest', 'Data/Studio/quests/*.json', QUEST_VALIDATOR);
registerEntityText('quest', { propertyInEntity: 'name', discriminator: 'id', textFileId: QUEST_NAME_TEXT_ID });
registerEntityText('quest', { propertyInEntity: 'description', discriminator: 'id', textFileId: QUEST_DESCRIPTION_TEXT_ID });

registerEntity('trainer', 'Data/Studio/trainers/*.json', TRAINER_VALIDATOR);
registerEntityText('trainer', { propertyInEntity: 'name', discriminator: 'id', textFileId: TRAINER_NAME_TEXT_ID });
registerEntityText('trainer', { propertyInEntity: 'victorySentence', discriminator: 'id', textFileId: TRAINER_VICTORY_SENTENCE_TEXT_ID });
registerEntityText('trainer', { propertyInEntity: 'defeateSentence', discriminator: 'id', textFileId: TRAINER_DEFEAT_SENTENCE_TEXT_ID });

registerEntity('type', 'Data/Studio/types/*.json', TYPE_VALIDATOR);
registerEntityText('type', { propertyInEntity: 'name', discriminator: 'textId', textFileId: TYPE_NAME_TEXT_ID });

registerEntity('zone', 'Data/Studio/zones/*.json', ZONE_VALIDATOR);
registerEntityText('zone', { propertyInEntity: 'name', discriminator: 'id', textFileId: ZONE_NAME_TEXT_ID });
registerEntityText('zone', { propertyInEntity: 'description', discriminator: 'id', textFileId: ZONE_DESCRIPTION_TEXT_ID });
