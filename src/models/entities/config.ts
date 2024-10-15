import { z } from 'zod';
import { POSITIVE_FLOAT, POSITIVE_INT, POSITIVE_OR_ZERO_FLOAT, POSITIVE_OR_ZERO_INT } from './common';
import { StudioProjectLanguageTranslation } from './project';

export const CREDIT_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Credits'),
  projectSplash: z.string(),
  bgm: z.string(),
  lineHeight: POSITIVE_INT,
  scrollSpeed: POSITIVE_FLOAT,
  leaderSpacing: POSITIVE_OR_ZERO_INT,
  chiefProjectTitle: z.string(),
  chiefProjectName: z.string(),
  leaders: z.array(
    z.object({
      title: z.string(),
      name: z.string(),
    })
  ),
  gameCredits: z.string(),
});
export type StudioCreditConfig = z.infer<typeof CREDIT_CONFIG_VALIDATOR>;

export const DEVICES_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Devices'),
  isMouseDisabled: z.boolean(),
  mouseSkin: z.string().or(z.null()),
});
export type StudioDevicesConfig = z.infer<typeof DEVICES_CONFIG_VALIDATOR>;

export const DISPLAY_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Display'),
  gameResolution: z.object({ x: POSITIVE_OR_ZERO_INT, y: POSITIVE_OR_ZERO_INT }),
  windowScale: POSITIVE_FLOAT,
  isFullscreen: z.boolean(),
  isPlayerAlwaysCentered: z.boolean(),
  tilemapSettings: z.object({
    tilemapClass: z.string(),
    tilemapSize: z.object({ x: POSITIVE_OR_ZERO_INT, y: POSITIVE_OR_ZERO_INT }),
    autotileIdleFrameCount: POSITIVE_INT,
    characterTileZoom: POSITIVE_FLOAT,
    characterSpriteZoom: POSITIVE_FLOAT,
    center: z.object({ x: POSITIVE_OR_ZERO_INT, y: POSITIVE_OR_ZERO_INT }),
    maplinkerOffset: z.object({ x: POSITIVE_OR_ZERO_INT, y: POSITIVE_OR_ZERO_INT }),
    isOldMaplinker: z.boolean(),
  }),
});
export type StudioDisplayConfig = z.infer<typeof DISPLAY_CONFIG_VALIDATOR>;

export const GAME_OPTION_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::GameOptions'),
  order: z.array(z.string()),
});
export type StudioGameOptionConfig = z.infer<typeof GAME_OPTION_CONFIG_VALIDATOR>;

export const GRAPHIC_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Graphic'),
  isSmoothTexture: z.boolean(),
  isVsyncEnabled: z.boolean(),
});
export type StudioGraphicConfig = z.infer<typeof GRAPHIC_CONFIG_VALIDATOR>;

export const INFO_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Infos'),
  gameTitle: z.string(),
  gameVersion: POSITIVE_OR_ZERO_INT,
});
export type StudioInfoConfig = z.infer<typeof INFO_CONFIG_VALIDATOR>;

export const LANGUAGE_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Language'),
  defaultLanguage: z.string(),
  choosableLanguageCode: z.array(z.string()),
  choosableLanguageTexts: z.array(z.string()),
});
export type StudioLanguageConfig = z.infer<typeof LANGUAGE_CONFIG_VALIDATOR>;

export const SAVE_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Save'),
  maximumSave: POSITIVE_OR_ZERO_INT,
  saveKey: POSITIVE_OR_ZERO_INT,
  saveHeader: z.string().min(5).max(5),
  baseFilename: z.string(),
  isCanSaveOnAnySave: z.boolean(),
});
export type StudioSaveConfig = z.infer<typeof SAVE_CONFIG_VALIDATOR>;

export const SCENE_TITLE_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::SceneTitle'),
  introMovieMapId: POSITIVE_OR_ZERO_INT,
  bgmName: z.string(),
  bgmDuration: POSITIVE_INT,
  isLanguageSelectionEnabled: z.boolean(),
  additionalSplashes: z.array(z.string()),
  controlWaitTime: POSITIVE_OR_ZERO_FLOAT.default(0.5),
});
export type StudioSceneTitleConfig = z.infer<typeof SCENE_TITLE_CONFIG_VALIDATOR>;

export const SETTINGS_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Settings'),
  pokemonMaxLevel: POSITIVE_INT,
  isAlwaysUseForm0ForEvolution: z.boolean(),
  isUseForm0WhenNoEvolutionData: z.boolean(),
  maxBagItemCount: POSITIVE_OR_ZERO_INT,
});
export type StudioSettingConfig = z.infer<typeof SETTINGS_CONFIG_VALIDATOR>;

const TTF_FILE_VALIDATOR = z.object({
  id: POSITIVE_OR_ZERO_INT,
  name: z.string(),
  size: POSITIVE_FLOAT,
  lineHeight: POSITIVE_INT,
});
const ALT_SIZE_VALIDATOR = TTF_FILE_VALIDATOR.omit({ name: true });
const FONT_CONFIG_VALIDATOR = z.object({
  isSupportsPokemonNumber: z.boolean(),
  ttfFiles: z.array(TTF_FILE_VALIDATOR),
  altSizes: z.array(ALT_SIZE_VALIDATOR),
});
const MESSAGE_CONFIG_VALIDATOR = z.object({
  windowSkin: z.union([z.string(), z.null()]).optional(),
  nameWindowSkin: z.union([z.string(), z.null()]).optional(),
  lineCount: POSITIVE_INT,
  borderSpacing: POSITIVE_OR_ZERO_INT,
  defaultFont: POSITIVE_OR_ZERO_INT,
  defaultColor: POSITIVE_OR_ZERO_INT,
  colorMapping: z.record(POSITIVE_OR_ZERO_INT, POSITIVE_OR_ZERO_INT),
});
const CHOICE_CONFIG_VALIDATOR = MESSAGE_CONFIG_VALIDATOR.omit({ nameWindowskin: true, lineCount: true });
export const TEXT_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Project::Texts'),
  fonts: FONT_CONFIG_VALIDATOR,
  messages: z.record(MESSAGE_CONFIG_VALIDATOR),
  choices: z.record(CHOICE_CONFIG_VALIDATOR),
});
export type StudioTextConfig = z.infer<typeof TEXT_CONFIG_VALIDATOR>;
export type StudioTextTtfFileConfig = z.infer<typeof TTF_FILE_VALIDATOR>;
export type StudioTextAltSizeConfig = z.infer<typeof ALT_SIZE_VALIDATOR>;
export type StudioTextMessageConfig = z.infer<typeof MESSAGE_CONFIG_VALIDATOR>;
export type StudioTextChoiceConfig = z.infer<typeof CHOICE_CONFIG_VALIDATOR>;

export const PSDK_CONFIG_VALIDATOR = z.object({
  gameTitle: z.string(),
});
export type StudioPSDKConfig = z.infer<typeof PSDK_CONFIG_VALIDATOR>;

export const getProjectLanguagesTranslationFromLanguageConfig = (config: StudioLanguageConfig): StudioProjectLanguageTranslation[] => {
  return config.choosableLanguageCode.map((code, index) => ({ code, name: config.choosableLanguageTexts[index] }));
};

export const DEFAULT_OTHER_LANGUAGES: readonly StudioProjectLanguageTranslation[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ko', name: 'Korean' },
  { code: 'kana', name: 'Japanese' },
];

export const DEFAULT_GAME_OPTIONS = [
  'language',
  'message_speed',
  'message_frame',
  'volume',
  'battle_animation',
  'battle_style',
  'screen_scale',
] as const;

export type DefaultGameOptions = (typeof DEFAULT_GAME_OPTIONS)[number];
