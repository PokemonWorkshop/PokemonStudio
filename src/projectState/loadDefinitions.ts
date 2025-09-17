import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_NAME_TEXT_ID,
  CREATURE_SPECIE_TEXT_ID,
  CREATURE_VALIDATOR,
} from '@modelEntities/creature';
import { registerEntity } from './load';
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
  SAVE_CONFIG_VALIDATOR,
  SCENE_TITLE_CONFIG_VALIDATOR,
  SETTINGS_CONFIG_VALIDATOR,
  TEXT_CONFIG_VALIDATOR,
} from '@modelEntities/config';
import {
  EntityListRefinementFunction,
  EntityTextDescription,
  loadTextByCSVAccess,
  loadTextByFileId,
  mapEntityListByCSVAccess,
  mapEntityListByFileId,
  registerEntityText,
} from './loadTextOfEntities';
import { StudioTextInfo, TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID, TEXT_INFO_VALIDATOR } from '@modelEntities/textInfo';
import { z } from 'zod';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, MAP_INFO_VALIDATOR } from '@modelEntities/mapInfo';

const fileIdDescriptor = (propertyInEntity: string, discriminator: string, fileId: number, isSystemFile = false): EntityTextDescription => ({
  propertyInEntity,
  discriminator,
  loadTexts: loadTextByFileId(fileId, isSystemFile),
});

const fileIdDescriptorWithList = (
  propertyInEntity: string,
  discriminator: string,
  fileId: number,
  isSystemFile = false,
  refinement?: EntityListRefinementFunction
): EntityTextDescription => ({
  propertyInEntity,
  discriminator,
  loadTexts: loadTextByFileId(fileId, isSystemFile),
  getEntityList: mapEntityListByFileId(refinement),
});

registerEntity('ability', 'Data/Studio/abilities/*.json', ABILITY_VALIDATOR);
registerEntityText('ability', fileIdDescriptorWithList('name', 'textId', ABILITY_NAME_TEXT_ID));
registerEntityText('ability', fileIdDescriptor('description', 'textId', ABILITY_DESCRIPTION_TEXT_ID));

registerEntity('config', 'Data/configs/credits_config.json', CREDIT_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/devices_config.json', DEVICES_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/display_config.json', DISPLAY_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/game_options_config.json', GAME_OPTION_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/graphic_config.json', GRAPHIC_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/infos_config.json', INFO_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/language_config.json', LANGUAGE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/save_config.json', SAVE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/scene_title_config.json', SCENE_TITLE_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/settings_config.json', SETTINGS_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/texts_config.json', TEXT_CONFIG_VALIDATOR);
registerEntity('config', 'Data/Studio/map_info.json', MAP_INFO_VALIDATOR);
registerEntityText('config', fileIdDescriptor('map_info[x].name', 'id', MAP_INFO_FOLDER_NAME_TEXT_ID, true));
registerEntity('config', 'Data/Studio/text_info.json', z.array(TEXT_INFO_VALIDATOR));
registerEntityText(
  'config',
  fileIdDescriptorWithList('text_info[x].name', 'textId', TEXT_INFO_NAME_TEXT_ID, true, (list) =>
    ((list.find(([key]) => key === 'text_info')?.[1] ?? []) as StudioTextInfo[]).map((v, i) => [`${i}`, v])
  )
);
registerEntityText('config', fileIdDescriptor('text_info[x].description', 'textId', TEXT_INFO_DESCRIPTION_TEXT_ID, true));

registerEntity('creature', 'Data/Studio/pokemon/*.json', CREATURE_VALIDATOR);
registerEntityText('creature', fileIdDescriptorWithList('name', 'id', CREATURE_NAME_TEXT_ID));
registerEntityText('creature', fileIdDescriptor('description', 'id', CREATURE_DESCRIPTION_TEXT_ID));
registerEntityText('creature', fileIdDescriptor('specie', 'id', CREATURE_SPECIE_TEXT_ID));
registerEntityText('creature', fileIdDescriptor('form[x].name', 'id', CREATURE_FORM_NAME_TEXT_ID));
registerEntityText('creature', fileIdDescriptor('form[x].description', 'id', CREATURE_FORM_DESCRIPTION_TEXT_ID));

registerEntity('dex', 'Data/Studio/dex/*.json', DEX_VALIDATOR);
registerEntityText('dex', {
  propertyInEntity: 'name',
  discriminator: 'csv',
  loadTexts: loadTextByCSVAccess(),
  getEntityList: mapEntityListByCSVAccess(),
});

registerEntity('group', 'Data/Studio/groups/*.json', GROUP_VALIDATOR);
registerEntityText('group', fileIdDescriptorWithList('name', 'id', GROUP_NAME_TEXT_ID));

registerEntity('item', 'Data/Studio/items/*.json', ITEM_VALIDATOR);
registerEntityText('item', fileIdDescriptorWithList('name', 'id', ITEM_NAME_TEXT_ID));
registerEntityText('item', fileIdDescriptor('pluralName', 'id', ITEM_PLURAL_NAME_TEXT_ID));
registerEntityText('item', fileIdDescriptor('description', 'id', ITEM_DESCRIPTION_TEXT_ID));

registerEntity('map', 'Data/Studio/maps/*.json', MAP_VALIDATOR);
registerEntityText('map', fileIdDescriptorWithList('name', 'mapId', MAP_NAME_TEXT_ID, true));

registerEntity('mapLink', 'Data/Studio/maplinks/*.json', MAP_LINK_VALIDATOR);
registerEntityText('mapLink', fileIdDescriptorWithList('name', 'mapId', MAP_NAME_TEXT_ID, true));

registerEntity('move', 'Data/Studio/moves/*.json', MOVE_VALIDATOR);
registerEntityText('move', fileIdDescriptorWithList('name', 'id', MOVE_NAME_TEXT_ID));
registerEntityText('move', fileIdDescriptor('description', 'id', MOVE_DESCRIPTION_TEXT_ID));

registerEntity('quest', 'Data/Studio/quests/*.json', QUEST_VALIDATOR);
registerEntityText('quest', fileIdDescriptorWithList('name', 'id', QUEST_NAME_TEXT_ID));
registerEntityText('quest', fileIdDescriptor('description', 'id', QUEST_DESCRIPTION_TEXT_ID));

registerEntity('trainer', 'Data/Studio/trainers/*.json', TRAINER_VALIDATOR);
registerEntityText('trainer', fileIdDescriptorWithList('name', 'id', TRAINER_NAME_TEXT_ID));
registerEntityText('trainer', fileIdDescriptor('victorySentence', 'id', TRAINER_VICTORY_SENTENCE_TEXT_ID));
registerEntityText('trainer', fileIdDescriptor('defeateSentence', 'id', TRAINER_DEFEAT_SENTENCE_TEXT_ID));

registerEntity('type', 'Data/Studio/types/*.json', TYPE_VALIDATOR);
registerEntityText('type', fileIdDescriptorWithList('name', 'textId', TYPE_NAME_TEXT_ID));

registerEntity('zone', 'Data/Studio/zones/*.json', ZONE_VALIDATOR);
registerEntityText('zone', fileIdDescriptorWithList('name', 'id', ZONE_NAME_TEXT_ID));
registerEntityText('zone', fileIdDescriptor('description', 'id', ZONE_DESCRIPTION_TEXT_ID));
