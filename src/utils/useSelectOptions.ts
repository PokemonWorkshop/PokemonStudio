import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import { CREATURE_NAME_TEXT_ID } from '@modelEntities/creature';
import { GROUP_NAME_TEXT_ID } from '@modelEntities/group';
import { ITEM_NAME_TEXT_ID, ITEM_POCKET_NAME_TEXT_ID } from '@modelEntities/item';
import { MOVE_NAME_TEXT_ID } from '@modelEntities/move';
import { QUEST_NAME_TEXT_ID } from '@modelEntities/quest';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { State } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';
import { cloneEntity } from './cloneEntity';
import { CSV_BASE, getText, pocketMapping } from './ReadingProjectText';

// Note: Regexp to search all options in the code: (\{ value:|\{ label:)

// List of possible option sources
const OPTION_SOURCE_KEYS = [
  'pocket',
  'items',
  'itemHeld',
  'itemStone',
  'itemGem',
  'moves',
  'abilities',
  'dex',
  'groups',
  'creatures',
  'quests',
  'types',
  'zones',
] as const;
export type OptionSourceKey = typeof OPTION_SOURCE_KEYS[number];
// Record holding all the options in the order they should appear on the select
const OptionSources: Record<OptionSourceKey, SelectOption[]> = {
  pocket: [],
  items: [],
  itemHeld: [],
  itemStone: [],
  itemGem: [],
  moves: [],
  abilities: [],
  dex: [],
  groups: [],
  creatures: [],
  quests: [],
  types: [],
  zones: [],
};

const TEXT_SOURCE_KEYS = ['pocket', 'items', 'moves', 'abilities', 'dex', 'groups', 'creatures', 'quests', 'types', 'zones'] as const;
type TextSourceKey = typeof TEXT_SOURCE_KEYS[number];
// Record holding the mapping from option source to text source
const OptionToTextKey: Record<OptionSourceKey, TextSourceKey> = {
  pocket: 'pocket',
  items: 'items',
  itemHeld: 'items',
  itemStone: 'items',
  itemGem: 'items',
  moves: 'moves',
  abilities: 'abilities',
  dex: 'dex',
  groups: 'groups',
  creatures: 'creatures',
  quests: 'quests',
  types: 'types',
  zones: 'zones',
};
// Record holding all the optionSource groups
const OptionSourceGroups: Record<TextSourceKey, OptionSourceKey[]> = {
  pocket: ['pocket'],
  items: ['items', 'itemHeld', 'itemStone', 'itemGem'],
  moves: ['moves'],
  abilities: ['abilities'],
  dex: ['dex'],
  groups: ['groups'],
  creatures: ['creatures'],
  quests: ['quests'],
  types: ['types'],
  zones: ['zones'],
};
// Record holding all the file ids for the required text sources
const TextFileIds: Record<TextSourceKey, number> = {
  pocket: ITEM_POCKET_NAME_TEXT_ID,
  items: ITEM_NAME_TEXT_ID,
  moves: MOVE_NAME_TEXT_ID,
  abilities: ABILITY_NAME_TEXT_ID,
  dex: 63,
  groups: GROUP_NAME_TEXT_ID,
  creatures: CREATURE_NAME_TEXT_ID,
  quests: QUEST_NAME_TEXT_ID,
  types: TYPE_NAME_TEXT_ID,
  zones: ZONE_NAME_TEXT_ID,
};
// Record holding the link between fileId and textSource
const TextFileIdsToSource = Object.fromEntries(Object.entries(TextFileIds).map(([key, value]) => [value, key])) as Record<number, TextSourceKey>;
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
  const projectText = { texts: state.projectText, config: state.projectConfig.language_config };
  const fileId = TextFileIds[key];
  const originalObjects = TextSources[key];
  const length = state.projectText[(CSV_BASE + fileId) as keyof typeof state.projectText].length;
  TextSources[key] = Array.from({ length }, (_, index) => getTextSource(projectText, fileId, index, originalObjects));
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
  const projectText = { texts: state.projectText, config: state.projectConfig.language_config };
  originalObjects[textId] = getTextSource(projectText, fileId, textId, originalObjects);
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
