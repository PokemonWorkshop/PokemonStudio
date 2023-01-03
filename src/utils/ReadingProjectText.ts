import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID } from '@modelEntities/creature';
import { StudioDex } from '@modelEntities/dex';
import { GROUP_NAME_TEXT_ID } from '@modelEntities/group';
import { ITEM_DESCRIPTION_TEXT_ID, ITEM_NAME_TEXT_ID, ITEM_POCKET_NAME_TEXT_ID, StudioItem } from '@modelEntities/item';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID } from '@modelEntities/move';
import { QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID } from '@modelEntities/quest';
import { TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { State, ProjectText, projectTextKeys, projectTextSave, TextsWithLanguageConfig, useGlobalState } from '@src/GlobalStateProvider';

type KeyProjectText = keyof ProjectText;

const CSV_BASE = 100_000;

const getLanguage = (fileText: string[][], defaultLanguage: string) => {
  const language = fileText[0].indexOf(defaultLanguage || 'en');
  return language == -1 ? 0 : language;
};

/**
 * Get a dialog message
 * @param projectText The text of the project
 * @param fileId id of the dialog file
 * @param textId id of the dialog message in the file (0 = 2nd line of csv, 1 = 3rd line of csv)
 * @param language language code of the language to get
 * @return the text
 */
export const getDialogMessage = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, language?: string) => {
  const fileText = projectText.texts[fileId as KeyProjectText];
  if (!fileText) return `Unable to find dialog file ${fileId}.`;
  const dialog = fileText[textId + 1];
  if (!dialog) return `Unable to find text ${textId} in dialog file ${fileId}.`;
  return dialog[getLanguage(fileText, language ?? projectText.config.defaultLanguage)];
};

/**
 * Get a text front the text database
 * @param projectText The text of the project
 * @param fileId ID of the text file
 * @param textId ID of the text in the file
 * @param language language code of the language to get
 * @returns the text
 */
export const getText = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, language?: string) => {
  return getDialogMessage(projectText, CSV_BASE + fileId, textId, language);
};

export const getNatureText = (state: State, natureDbSymbol: string) => {
  return getText(
    { texts: state.projectText, config: state.projectConfig.language_config },
    8,
    (state.projectConfig.natures.data[state.projectConfig.natures.db_symbol_to_id[natureDbSymbol] || 0] || [0])[0]
  );
};

/**
 * Set a dialog message
 * @param projectText The text of the project
 * @param fileId id of the dialog file
 * @param textId id of the dialog message in the file (0 = 2nd line of csv, 1 = 3rd line of csv)
 * @param text text to set
 * @param language language code of the language to get
 */
export const setDialogMessage = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, text: string, language?: string) => {
  projectTextSave[projectTextKeys.indexOf(fileId as KeyProjectText)] = true;
  const fileText = projectText.texts[fileId as KeyProjectText];
  if (!fileText) return;

  if (!fileText[textId + 1]) {
    fileText[textId + 1] = new Array(fileText[0].length).fill(text);
  } else {
    fileText[textId + 1][getLanguage(fileText, language ?? projectText.config.defaultLanguage)] = text;
  }
};

/**
 * Get a text front the text database
 * @param projectText The text of the project
 * @param fileId ID of the text file
 * @param textId ID of the text in the file
 * @param text text to set
 * @param language language code of the language to get
 */
export const setText = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, text: string, language?: string) => {
  return setDialogMessage(projectText, CSV_BASE + fileId, textId, text, language);
};

export const useGetProjectText = () => {
  const [{ projectText: texts, projectConfig }] = useGlobalState();

  return (fileId: number, textId: number): string =>
    getText({ texts, config: projectConfig.language_config }, fileId, textId, projectConfig.language_config.defaultLanguage);
};

export const useSetProjectText = () => {
  const [{ projectText: texts, projectConfig }] = useGlobalState();

  return (fileId: number, textId: number, text: string) =>
    setText({ texts, config: projectConfig.language_config }, fileId, textId, text, projectConfig.language_config.defaultLanguage);
};

const ENTITY_TO_NAME_TEXT = {
  Ability: ABILITY_NAME_TEXT_ID,
  Specie: CREATURE_NAME_TEXT_ID,
  Item: ITEM_NAME_TEXT_ID,
  HealingItem: ITEM_NAME_TEXT_ID,
  PPHealItem: ITEM_NAME_TEXT_ID,
  AllPPHealItem: ITEM_NAME_TEXT_ID,
  BallItem: ITEM_NAME_TEXT_ID,
  ConstantHealItem: ITEM_NAME_TEXT_ID,
  StatBoostItem: ITEM_NAME_TEXT_ID,
  EVBoostItem: ITEM_NAME_TEXT_ID,
  EventItem: ITEM_NAME_TEXT_ID,
  FleeingItem: ITEM_NAME_TEXT_ID,
  LevelIncreaseItem: ITEM_NAME_TEXT_ID,
  PPIncreaseItem: ITEM_NAME_TEXT_ID,
  RateHealItem: ITEM_NAME_TEXT_ID,
  RepelItem: ITEM_NAME_TEXT_ID,
  StatusConstantHealItem: ITEM_NAME_TEXT_ID,
  StatusHealItem: ITEM_NAME_TEXT_ID,
  StatusRateHealItem: ITEM_NAME_TEXT_ID,
  StoneItem: ITEM_NAME_TEXT_ID,
  TechItem: ITEM_NAME_TEXT_ID,
  Move: MOVE_NAME_TEXT_ID,
  Quest: QUEST_NAME_TEXT_ID,
  TrainerBattleSetup: TRAINER_NAME_TEXT_ID,
  Type: TYPE_NAME_TEXT_ID,
  Zone: ZONE_NAME_TEXT_ID,
  Group: GROUP_NAME_TEXT_ID,
};

// TODO: All entities must accept undefined! (due to getting entity from state unsafely) => returns empty string and let UI manage it
// '' || '???' = '???'
export const useGetEntityNameText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: keyof Omit<typeof ENTITY_TO_NAME_TEXT, 'Ability' | 'Type'>; id: number }) =>
    getEntityText(ENTITY_TO_NAME_TEXT[entity.klass], entity.id);
};

export const useGetEntityNameTextUsingTextId = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: 'Ability' | 'Type'; textId: number }) => getEntityText(ENTITY_TO_NAME_TEXT[entity.klass], entity.textId);
};

// Mapping between pocket id and pocket name id
export const pocketMapping = [0, 4, 1, 5, 3, 8, 0];
export const getItemPocketText = (item: StudioItem, state: State): string => {
  return getText(
    { texts: state.projectText, config: state.projectConfig.language_config },
    ITEM_POCKET_NAME_TEXT_ID,
    pocketMapping[item.socket] || item.socket
  );
};
export const useGetItemPocketText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: StudioItem['klass']; socket: number }) =>
    getEntityText(ITEM_POCKET_NAME_TEXT_ID, pocketMapping[entity.socket] || entity.socket);
};

export const useGetEntityNameUsingCSV = () => {
  const getEntityText = useGetProjectText();

  return (entity: { csv: StudioDex['csv'] }) => getEntityText(entity.csv.csvFileId, entity.csv.csvTextIndex);
};

const ENTITY_TO_DESCRIPTION_TEXT = {
  Ability: ABILITY_DESCRIPTION_TEXT_ID,
  Specie: CREATURE_DESCRIPTION_TEXT_ID,
  Item: ITEM_DESCRIPTION_TEXT_ID,
  HealingItem: ITEM_DESCRIPTION_TEXT_ID,
  PPHealItem: ITEM_DESCRIPTION_TEXT_ID,
  AllPPHealItem: ITEM_DESCRIPTION_TEXT_ID,
  BallItem: ITEM_DESCRIPTION_TEXT_ID,
  ConstantHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatBoostItem: ITEM_DESCRIPTION_TEXT_ID,
  EVBoostItem: ITEM_DESCRIPTION_TEXT_ID,
  EventItem: ITEM_DESCRIPTION_TEXT_ID,
  FleeingItem: ITEM_DESCRIPTION_TEXT_ID,
  LevelIncreaseItem: ITEM_DESCRIPTION_TEXT_ID,
  PPIncreaseItem: ITEM_DESCRIPTION_TEXT_ID,
  RateHealItem: ITEM_DESCRIPTION_TEXT_ID,
  RepelItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusConstantHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusRateHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StoneItem: ITEM_DESCRIPTION_TEXT_ID,
  TechItem: ITEM_DESCRIPTION_TEXT_ID,
  Move: MOVE_DESCRIPTION_TEXT_ID,
  Quest: QUEST_DESCRIPTION_TEXT_ID,
  Zone: ZONE_DESCRIPTION_TEXT_ID,
};

export const useGetEntityDescriptionText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: keyof Omit<typeof ENTITY_TO_DESCRIPTION_TEXT, 'Ability'>; id: number }) =>
    getEntityText(ENTITY_TO_DESCRIPTION_TEXT[entity.klass], entity.id);
};

export const useGetEntityDescriptionTextUsingTextId = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: 'Ability'; textId: number }) => getEntityText(ENTITY_TO_DESCRIPTION_TEXT.Ability, entity.textId);
};

export const getEntityNameText = (
  entity: { klass: keyof Omit<typeof ENTITY_TO_NAME_TEXT, 'Ability' | 'Type'>; id: number },
  { projectText: texts, projectConfig }: Pick<State, 'projectText' | 'projectConfig'>
) => {
  return getText(
    { texts, config: projectConfig.language_config },
    ENTITY_TO_NAME_TEXT[entity.klass],
    entity.id,
    projectConfig.language_config.defaultLanguage
  );
};

export const getEntityNameTextUsingTextId = (
  entity: { klass: 'Ability' | 'Type'; textId: number },
  { projectText: texts, projectConfig }: Pick<State, 'projectText' | 'projectConfig'>
) => {
  return getText(
    { texts, config: projectConfig.language_config },
    ENTITY_TO_NAME_TEXT[entity.klass],
    entity.textId,
    projectConfig.language_config.defaultLanguage
  );
};
