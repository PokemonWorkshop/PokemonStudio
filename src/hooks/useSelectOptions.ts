import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import { CREATURE_NAME_TEXT_ID } from '@modelEntities/creature';
import { GROUP_NAME_TEXT_ID } from '@modelEntities/group';
import { ITEM_NAME_TEXT_ID, ITEM_POCKET_NAME_TEXT_ID } from '@modelEntities/item';
import { MOVE_NAME_TEXT_ID } from '@modelEntities/move';
import { QUEST_NAME_TEXT_ID } from '@modelEntities/quest';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { State } from '@src/GlobalStateProvider';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';
import { getText, pocketMapping } from '@utils/ReadingProjectText';
import { DEX_DEFAULT_NAME_TEXT_ID } from '@modelEntities/dex';
import { MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { TRAINER_CLASS_TEXT_ID, TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';

// Note: Regexp to search all options in the code: (\{ value:|\{ label:)

// List of possible option sources
const OPTION_SOURCE_KEYS = [
  'pocket',
  'items',
  'itemHeld',
  'itemStone',
  'itemGem',
  'itemBall',
  'moves',
  'abilities',
  'dex',
  'groups',
  'creatures',
  'quests',
  'types',
  'zones',
  'textInfos',
  'maps',
  'trainers',
] as const;
export type OptionSourceKey = (typeof OPTION_SOURCE_KEYS)[number];
// Record holding all the options in the order they should appear on the select
const OptionSources: Record<OptionSourceKey, SelectOption[]> = {
  pocket: [],
  items: [],
  itemHeld: [],
  itemStone: [],
  itemGem: [],
  itemBall: [],
  moves: [],
  abilities: [],
  dex: [],
  groups: [],
  creatures: [],
  quests: [],
  types: [],
  zones: [],
  textInfos: [],
  maps: [],
  trainers: [],
};

const TEXT_SOURCE_KEYS = [
  'pocket',
  'items',
  'moves',
  'abilities',
  'dex',
  'groups',
  'creatures',
  'quests',
  'types',
  'zones',
  'textInfos',
  'maps',
  'trainers',
] as const;
type TextSourceKey = (typeof TEXT_SOURCE_KEYS)[number];
// Record holding the mapping from option source to text source
const OptionToTextKey: Record<OptionSourceKey, TextSourceKey> = {
  pocket: 'pocket',
  items: 'items',
  itemHeld: 'items',
  itemStone: 'items',
  itemGem: 'items',
  itemBall: 'items',
  moves: 'moves',
  abilities: 'abilities',
  dex: 'dex',
  groups: 'groups',
  creatures: 'creatures',
  quests: 'quests',
  types: 'types',
  zones: 'zones',
  textInfos: 'textInfos',
  maps: 'maps',
  trainers: 'trainers',
};
// Record holding all the optionSource groups
const OptionSourceGroups: Record<TextSourceKey, OptionSourceKey[]> = {
  pocket: ['pocket'],
  items: ['items', 'itemHeld', 'itemStone', 'itemGem', 'itemBall'],
  moves: ['moves'],
  abilities: ['abilities'],
  dex: ['dex'],
  groups: ['groups'],
  creatures: ['creatures'],
  quests: ['quests'],
  types: ['types'],
  zones: ['zones'],
  textInfos: ['textInfos'],
  maps: ['maps'],
  trainers: ['trainers'],
};
// Record holding all the file ids for the required text sources
const TextFileIds: Record<TextSourceKey, number[]> = {
  pocket: [ITEM_POCKET_NAME_TEXT_ID],
  items: [ITEM_NAME_TEXT_ID],
  moves: [MOVE_NAME_TEXT_ID],
  abilities: [ABILITY_NAME_TEXT_ID],
  dex: [DEX_DEFAULT_NAME_TEXT_ID],
  groups: [GROUP_NAME_TEXT_ID],
  creatures: [CREATURE_NAME_TEXT_ID],
  quests: [QUEST_NAME_TEXT_ID],
  types: [TYPE_NAME_TEXT_ID],
  zones: [ZONE_NAME_TEXT_ID],
  textInfos: [TEXT_INFO_NAME_TEXT_ID],
  maps: [MAP_NAME_TEXT_ID],
  trainers: [TRAINER_CLASS_TEXT_ID, TRAINER_NAME_TEXT_ID],
};
// Record holding the link between fileId and textSource
const TextFileIdsToSource: Record<number, TextSourceKey> = {};
Object.entries(TextFileIds).forEach(([sourceKey, ids]) => {
  ids.forEach((id) => {
    TextFileIdsToSource[id] = sourceKey as TextSourceKey;
  });
});
// Record holding all the texts (options) in the order of the texts in the text files
const TextSources: Record<TextSourceKey, SelectOption[]> = {
  pocket: [],
  items: [],
  moves: [],
  abilities: [],
  dex: [],
  groups: [],
  creatures: [],
  quests: [],
  types: [],
  zones: [],
  textInfos: [],
  maps: [],
  trainers: [],
};

const getTextSource = (projectText: Parameters<typeof getText>[0], fileId: number, index: number, originalObjects: SelectOption[]) => {
  const original = originalObjects[index];
  if (original) {
    original.label = getText(projectText, fileId, index);
    return original;
  }
  return { value: '', label: getText(projectText, fileId, index) };
};

// Build a text source
const buildTextSourceFromScratch = (key: TextSourceKey, state: State) => {
  const projectText = {
    texts: state.projectText,
    languages: state.projectStudio.languagesTranslation,
    defaultLanguage: state.projectConfig.language_config.defaultLanguage,
  };
  const fileIds = TextFileIds[key];
  const originalObjects = TextSources[key];
  if (fileIds.length === 0) {
    throw new Error(`No file id defines for ${key} key`);
  }

  if (fileIds.length === 1) {
    const fileId = fileIds[0];
    const length = state.projectText[fileId].length;
    TextSources[key] = Array.from({ length }, (_, index) => getTextSource(projectText, fileId, index, originalObjects));
  } else {
    TextSources[key] = [];
    fileIds.forEach((fileId) => {
      const length = state.projectText[fileId].length;
      if (TextSources[key].length === 0) {
        TextSources[key] = Array.from({ length }, (_, index) => getTextSource(projectText, fileId, index, originalObjects));
      } else {
        TextSources[key] = TextSources[key].map((option, index) => {
          if (index < length) {
            return { value: option.value, label: `${option.label} ${getTextSource(projectText, fileId, index, originalObjects).label}` };
          } else {
            return option;
          }
        });
      }
    });
  }
};

// Build all the text from scratch
export const buildSelectOptionsTextSourcesFromScratch = (state: State) => {
  TEXT_SOURCE_KEYS.forEach((key) => buildTextSourceFromScratch(key, state));
};

// Update a text source
export const updateSelectOptionsTextSource = (fileId: number, textId: number, state: State) => {
  const key = TextFileIdsToSource[fileId];
  if (!key) return;
  const originalObjects = TextSources[key];
  const projectText = {
    texts: state.projectText,
    languages: state.projectStudio.languagesTranslation,
    defaultLanguage: state.projectConfig.language_config.defaultLanguage,
  };
  const fileIds = TextFileIds[key];
  if (fileIds.length === 0) {
    throw new Error(`No file id defines for ${key} key`);
  }

  if (fileIds.length === 1) {
    originalObjects[textId] = getTextSource(projectText, fileId, textId, originalObjects);
  } else {
    const option = { value: '', label: '' };
    fileIds.forEach((fileId) => (option.label = `${option.label} ${getTextSource(projectText, fileId, textId, originalObjects).label}`));
    originalObjects[textId] = option;
  }
};

const adjustSelectOptionValue = (option: SelectOption, value: string) => {
  option.value = value;
  return option;
};

const buildSelectOptionsFromKey = (key: OptionSourceKey, state: State) => {
  const textKey = OptionToTextKey[key];
  const originalObjects = TextSources[textKey];
  switch (key) {
    case 'pocket':
      return pocketMapping
        .slice(1)
        .map((i) => adjustSelectOptionValue(originalObjects[i] || cloneEntity(originalObjects[0]), i.toString()))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'items':
      return Object.values(state.projectData.items)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'itemHeld':
      return Object.values(state.projectData.items)
        .filter((data) => data.isHoldable)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'itemStone':
      return Object.values(state.projectData.items)
        .filter((data) => data.klass === 'StoneItem')
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'itemGem':
      return Object.values(state.projectData.items)
        .filter((data) => data.klass === 'Item' && data.isHoldable)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'itemBall':
      return Object.values(state.projectData.items)
        .filter((data) => data.klass === 'BallItem')
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'moves':
      return Object.values(state.projectData.moves)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'abilities':
      return Object.values(state.projectData.abilities)
        .map((data) => adjustSelectOptionValue(originalObjects[data.textId] || cloneEntity(originalObjects[0]), data.dbSymbol))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'dex':
      return Object.values(state.projectData.dex)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.csv.csvTextIndex] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'groups':
      return Object.values(state.projectData.groups)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'creatures':
      return Object.values(state.projectData.pokemon)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'quests':
      return Object.values(state.projectData.quests)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'types':
      return Object.values(state.projectData.types)
        .map((data) => adjustSelectOptionValue(originalObjects[data.textId] || cloneEntity(originalObjects[0]), data.dbSymbol))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'zones':
      return Object.values(state.projectData.zones)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'textInfos':
      return state.textInfos
        .slice()
        .sort((a, b) => a.fileId - b.fileId)
        .map((data) => adjustSelectOptionValue(originalObjects[data.textId] || cloneEntity(originalObjects[0]), data.fileId.toString()));
    case 'maps':
      return Object.values(state.projectData.maps)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    case 'trainers':
      return Object.values(state.projectData.trainers)
        .sort((a, b) => a.id - b.id)
        .map((data) => adjustSelectOptionValue(originalObjects[data.id] || cloneEntity(originalObjects[0]), data.dbSymbol));
    default:
      assertUnreachable(key);
  }
  return [];
};

// Build the options from scratch
export const buildSelectOptionsFromScratch = (state: State) => {
  OPTION_SOURCE_KEYS.forEach((key) => {
    OptionSources[key] = buildSelectOptionsFromKey(key, state);
  });
};

// Add new option
export const addSelectOption = (key: TextSourceKey, state: State) => {
  // TODO: Possible optimization
  OptionSourceGroups[key].forEach((optionKey) => (OptionSources[optionKey] = buildSelectOptionsFromKey(optionKey, state)));
};

// Remove an option
export const removeSelectOption = (key: TextSourceKey, optionValue: string) => {
  // TODO: Possible optimization
  OptionSourceGroups[key].forEach((optionKey) => (OptionSources[optionKey] = OptionSources[optionKey].filter(({ value }) => value !== optionValue)));
};

export const useSelectOptions = (key: OptionSourceKey) => {
  return OptionSources[key];
};
