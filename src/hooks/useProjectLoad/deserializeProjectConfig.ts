import {
  CREDIT_CONFIG_VALIDATOR,
  DEVICES_CONFIG_VALIDATOR,
  DISPLAY_CONFIG_VALIDATOR,
  GRAPHIC_CONFIG_VALIDATOR,
  INFO_CONFIG_VALIDATOR,
  LANGUAGE_CONFIG_VALIDATOR,
  SAVE_CONFIG_VALIDATOR,
  SCENE_TITLE_CONFIG_VALIDATOR,
  SETTINGS_CONFIG_VALIDATOR,
  TEXT_CONFIG_VALIDATOR,
  GAME_OPTION_CONFIG_VALIDATOR,
} from '@modelEntities/config';
import type { PSDKConfigs } from '@src/GlobalStateProvider';
import { deserializeZodConfig } from '@utils/SerializationUtils';
import { ProjectConfigsFromBackEnd } from '@src/backendTasks/readProjectConfigs';

export const deserializeProjectConfig = (configs: ProjectConfigsFromBackEnd) => {
  const projectConfigs: PSDKConfigs = {
    credits_config: deserializeZodConfig(configs.credits_config, CREDIT_CONFIG_VALIDATOR),
    devices_config: deserializeZodConfig(configs.devices_config, DEVICES_CONFIG_VALIDATOR),
    display_config: deserializeZodConfig(configs.display_config, DISPLAY_CONFIG_VALIDATOR),
    graphic_config: deserializeZodConfig(configs.graphic_config, GRAPHIC_CONFIG_VALIDATOR),
    infos_config: deserializeZodConfig(configs.infos_config, INFO_CONFIG_VALIDATOR),
    language_config: deserializeZodConfig(configs.language_config, LANGUAGE_CONFIG_VALIDATOR),
    save_config: deserializeZodConfig(configs.save_config, SAVE_CONFIG_VALIDATOR),
    scene_title_config: deserializeZodConfig(configs.scene_title_config, SCENE_TITLE_CONFIG_VALIDATOR),
    settings_config: deserializeZodConfig(configs.settings_config, SETTINGS_CONFIG_VALIDATOR),
    texts_config: deserializeZodConfig(configs.texts_config, TEXT_CONFIG_VALIDATOR),
    game_options_config: deserializeZodConfig(configs.game_options_config, GAME_OPTION_CONFIG_VALIDATOR),
  };
  return projectConfigs;
};
